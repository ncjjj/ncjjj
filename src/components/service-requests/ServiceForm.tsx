"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import UploadFields from "./UploadFields";
import { getServiceMeta } from "../../lib/serviceCatalog";

type ServiceFormProps = {
  serviceId: string;
};

type UploadedFile = {
  type: string;
  filePath: string;
  signedUrl?: string | null;
  fileName: string;
  mimeType: string;
};

type ExistingDocument = {
  id: string;
  fileName: string;
  documentType: string;
  filePath: string;
  signedUrl?: string | null;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const formSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  phone: z.string().trim().min(6, "Valid phone number is required."),
  pan: z.string().trim().min(10, "Valid PAN is required."),
  aadhaar: z.string().trim().min(12, "Valid Aadhaar is required."),
  gstNumber: z.string().trim().max(30).optional().or(z.literal("")),
});

export default function ServiceForm({ serviceId }: ServiceFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    pan: "",
    aadhaar: "",
    gstNumber: "",
  });
  const [requiredFiles, setRequiredFiles] = useState<Record<string, File | null>>({
    panCard: null,
    aadhaarCard: null,
    photo: null,
    signature: null,
  });
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const service = useMemo(() => getServiceMeta(serviceId), [serviceId]);

  const requiredDocTypeMap = {
    panCard: "PAN Card",
    aadhaarCard: "Aadhaar Card",
    photo: "Passport Size Photo",
    signature: "Signature",
  } as const;

  const requiredServiceTypeMap = {
    panCard: "pan",
    aadhaarCard: "aadhaar",
    photo: "photo",
    signature: "signature",
  } as const;

  const prefilledRequiredDocs = useMemo(() => {
    const byType = (docType: string) =>
      existingDocuments.find((doc) => doc.documentType === docType) || null;

    return {
      panCard: byType(requiredDocTypeMap.panCard),
      aadhaarCard: byType(requiredDocTypeMap.aadhaarCard),
      photo: byType(requiredDocTypeMap.photo),
      signature: byType(requiredDocTypeMap.signature),
    };
  }, [existingDocuments]);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      setLoading(true);
      setError("");

      try {
        const [response, docsResponse] = await Promise.all([
          fetch(`/api/service-request?serviceId=${serviceId}&scope=form`, { cache: "no-store" }),
          fetch("/api/documents", { cache: "no-store" }),
        ]);

        const [payload, docsPayload] = await Promise.all([
          response.json(),
          docsResponse.json(),
        ]);

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load profile details.");
        }

        if (!isMounted) {
          return;
        }

        setForm((prev) => ({
          ...prev,
          name: payload?.profile?.name || "",
          phone: payload?.profile?.phone || "",
          pan: payload?.defaults?.pan || "",
          aadhaar: payload?.defaults?.aadhaar || "",
          gstNumber: payload?.defaults?.gstNumber || "",
        }));

        if (docsResponse.ok) {
          setExistingDocuments(docsPayload.documents || []);
        }
      } catch (fetchError: unknown) {
        if (!isMounted) {
          return;
        }

        setError(getErrorMessage(fetchError, "Unable to load service form."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  const onChangeField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (name: string, file: File | null) => {
    setRequiredFiles((prev) => ({ ...prev, [name]: file }));
  };

  const uploadDocuments = async (): Promise<UploadedFile[]> => {
    const prefilledFiles: UploadedFile[] = Object.entries(requiredServiceTypeMap)
      .map(([fieldName, serviceType]) => {
        const existingDoc = prefilledRequiredDocs[fieldName as keyof typeof requiredServiceTypeMap];

        if (!existingDoc) {
          return null;
        }

        return {
          type: serviceType,
          filePath: existingDoc.filePath,
          signedUrl: existingDoc.signedUrl || null,
          fileName: existingDoc.fileName,
          mimeType: "",
        };
      })
      .filter(Boolean) as UploadedFile[];

    const uploadPayload = new FormData();

    Object.entries(requiredFiles).forEach(([name, file]) => {
      if (file) {
        uploadPayload.append(name, file);
      }
    });

    additionalFiles.forEach((file) => {
      uploadPayload.append("additionalDocuments", file);
    });

    if (Array.from(uploadPayload.keys()).length === 0) {
      return prefilledFiles;
    }

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: uploadPayload,
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadResult?.message || "Unable to upload documents.");
    }

    const uploadedFiles = (uploadResult.files || []) as UploadedFile[];
    const uploadedByType = new Map(uploadedFiles.map((item) => [item.type, item]));

    const mergedPrefilled = prefilledFiles.filter((item) => !uploadedByType.has(item.type));

    return [...uploadedFiles, ...mergedPrefilled];
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const parsed = formSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid form details.");
      return;
    }

    const requiredMissing = Object.entries(requiredFiles).some(([key, file]) => {
      if (file) {
        return false;
      }

      return !prefilledRequiredDocs[key as keyof typeof requiredServiceTypeMap];
    });

    if (requiredMissing) {
      setError("PAN, Aadhaar, photo and signature files are mandatory.");
      return;
    }

    setSubmitting(true);

    try {
      const uploadedFiles = await uploadDocuments();

      const response = await fetch("/api/service-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...parsed.data,
          serviceId,
          documents: uploadedFiles.map((file) => ({
            type: file.type,
            filePath: file.filePath,
          })),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to create service request.");
      }

      setMessage("Request submitted. Admin verification has started.");
      setRequiredFiles({ panCard: null, aadhaarCard: null, photo: null, signature: null });
      setAdditionalFiles([]);
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, "Unable to submit your request."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#e8dcc0] bg-white/80 p-8 text-[#6b5b3e]">
        Loading service request form...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl rounded-3xl border border-[#e8dcc0] bg-white/85 p-8 shadow-xl">
      <div className="mb-8 space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-[#7a6a4f]">Service Request</p>
        <h1 className="text-3xl font-semibold text-[#3b2f1c]">{service.name}</h1>
        <p className="text-sm text-[#6b5b3e]">{service.description}</p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <input type="hidden" name="serviceId" value={serviceId} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#6b5b3e]">
            Name
            <input
              value={form.name}
              onChange={(event) => onChangeField("name", event.target.value)}
              className="w-full rounded-xl border border-[#e5d7b6] bg-[#faf6ed] px-4 py-3"
            />
          </label>

          <label className="space-y-2 text-sm text-[#6b5b3e]">
            Phone
            <input
              value={form.phone}
              onChange={(event) => onChangeField("phone", event.target.value)}
              className="w-full rounded-xl border border-[#e5d7b6] bg-[#faf6ed] px-4 py-3"
            />
          </label>

          <label className="space-y-2 text-sm text-[#6b5b3e]">
            PAN
            <input
              value={form.pan}
              onChange={(event) => onChangeField("pan", event.target.value)}
              className="w-full rounded-xl border border-[#e5d7b6] bg-[#faf6ed] px-4 py-3 uppercase"
            />
          </label>

          <label className="space-y-2 text-sm text-[#6b5b3e]">
            Aadhaar
            <input
              value={form.aadhaar}
              onChange={(event) => onChangeField("aadhaar", event.target.value)}
              className="w-full rounded-xl border border-[#e5d7b6] bg-[#faf6ed] px-4 py-3"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-[#6b5b3e]">
          GST Number (optional)
          <input
            value={form.gstNumber}
            onChange={(event) => onChangeField("gstNumber", event.target.value)}
            className="w-full rounded-xl border border-[#e5d7b6] bg-[#faf6ed] px-4 py-3 uppercase"
          />
        </label>

        <UploadFields
          onFileChange={onFileChange}
          onAdditionalFilesChange={setAdditionalFiles}
          existingRequiredDocs={prefilledRequiredDocs}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] py-3 font-semibold text-white shadow disabled:opacity-70"
        >
          {submitting ? "Submitting..." : "Submit For Verification"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      {message ? (
        <div className="mt-4 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <p>{message}</p>
          <Link href="/dashboard/consultations" className="font-semibold underline">
            Track request status
          </Link>
        </div>
      ) : null}
    </div>
  );
}
