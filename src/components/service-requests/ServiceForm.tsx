"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import {
  getPermanentDocumentDescription,
  getPermanentDocumentLabel,
  requiredPermanentDocumentTypes,
  type PermanentDocumentType,
} from "../../lib/permanentDocumentTypes";
import { getServiceMeta } from "../../lib/serviceCatalog";
import { formatFinancialYear } from "../../lib/yearlyDocumentTypes";

type ServiceFormProps = {
  serviceId: string;
};

type PermanentDocumentNumbers = {
  aadharNumber: string;
  panNumber: string;
  accountNumber: string;
  gstNumber: string;
};

type SavedPermanentDocument = {
  id: string;
  documentType: PermanentDocumentType;
  documentLabel: string;
  documentDescription: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  signedUrl: string | null;
  documentSignedUrl?: string | null;
  mimeType: string | null;
  aadharNumber: string | null;
  panNumber: string | null;
  accountNumber: string | null;
  gstNumber: string | null;
  uploadDescription: string | null;
  createdAt: string;
};

type PermanentDocumentsPayload = {
  documents?: SavedPermanentDocument[];
  numbers?: PermanentDocumentNumbers;
  message?: string;
};

type YearlyDocumentItem = {
  id: string;
  documentYear: number;
  documentSlot: string;
  fileName: string;
  filePath: string;
  storagePath?: string;
  signedUrl: string | null;
  mimeType: string | null;
  createdAt: string;
};

type YearlyDocumentsPayload = {
  documents?: YearlyDocumentItem[];
  message?: string;
};

type AdditionalServiceDocument = {
  name: string;
  file: File | null;
};

const emptyNumbers: PermanentDocumentNumbers = {
  aadharNumber: "",
  panNumber: "",
  accountNumber: "",
  gstNumber: "",
};

const emptyAdditionalServiceDocuments: AdditionalServiceDocument[] = [
  { name: "", file: null },
  { name: "", file: null },
  { name: "", file: null },
];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const formSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  phone: z.string().trim().min(6, "Valid phone number is required."),
  pan: z.string().trim().min(10, "Update a valid PAN number in Documents."),
  aadhaar: z.string().trim().min(12, "Update a valid Aadhaar number in Documents."),
  accountNumber: z.string().trim().min(1, "Update your account number in Documents."),
  gstNumber: z.string().trim().max(30).optional().or(z.literal("")),
});

function getServiceDocumentType(document: SavedPermanentDocument): string {
  if (document.documentType === "aadhar") {
    return "aadhaar";
  }

  if (document.documentType === "pan") {
    return "pan";
  }

  return document.uploadDescription?.trim() || getPermanentDocumentLabel(document.documentType);
}

export default function ServiceForm({ serviceId }: ServiceFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    pan: "",
    aadhaar: "",
    accountNumber: "",
    gstNumber: "",
  });
  const [permanentDocuments, setPermanentDocuments] = useState<SavedPermanentDocument[]>([]);
  const [yearlyDocuments, setYearlyDocuments] = useState<YearlyDocumentItem[]>([]);
  const [additionalServiceDocuments, setAdditionalServiceDocuments] = useState<AdditionalServiceDocument[]>(
    emptyAdditionalServiceDocuments
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const service = useMemo(() => getServiceMeta(serviceId), [serviceId]);

  const documentsByType = useMemo(() => {
    const map = new Map<PermanentDocumentType, SavedPermanentDocument>();

    for (const document of permanentDocuments) {
      if (!map.has(document.documentType)) {
        map.set(document.documentType, document);
      }
    }

    return map;
  }, [permanentDocuments]);

  const savedServiceDocuments = useMemo(
    () => {
      const documents = permanentDocuments.map((document) => ({
        type: getServiceDocumentType(document),
        filePath: document.storagePath || document.fileUrl,
      }));

      const bankStatement = yearlyDocuments
        .filter((document) => document.documentSlot === "bank_statement")
        .sort((left, right) => {
          if (right.documentYear !== left.documentYear) {
            return right.documentYear - left.documentYear;
          }

          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        })[0];

      if (bankStatement) {
        documents.push({
          type: "bank_statement",
          filePath: bankStatement.filePath || bankStatement.storagePath || "",
        });
      }

      return documents;
    },
    [permanentDocuments, yearlyDocuments]
  );

  const latestBankStatement = useMemo(() => {
    return yearlyDocuments
      .filter((document) => document.documentSlot === "bank_statement")
      .sort((left, right) => {
        if (right.documentYear !== left.documentYear) {
          return right.documentYear - left.documentYear;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      })[0] || null;
  }, [yearlyDocuments]);

  const missingRequiredDocuments = useMemo(() => {
    const missing = requiredPermanentDocumentTypes
      .filter((documentType) => !documentsByType.has(documentType))
      .map((documentType) => getPermanentDocumentLabel(documentType));

    if (!latestBankStatement) {
      missing.unshift("Bank Statement");
    }

    return missing;
  }, [documentsByType, latestBankStatement]);

  useEffect(() => {
    let isMounted = true;

    function hydrate() {
      if (!isMounted) {
        return;
      }

      setLoading(false);
      setError("");
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  const onChangeField = (name: "name" | "phone", value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onAdditionalDocumentChange = (
    index: number,
    field: keyof AdditionalServiceDocument,
    value: string | File | null
  ) => {
    setAdditionalServiceDocuments((previous) =>
      previous.map((document, documentIndex) =>
        documentIndex === index ? { ...document, [field]: value } : document
      )
    );
  };

  const uploadAdditionalDocuments = async () => {
    const documentsToUpload = additionalServiceDocuments
      .map((document, index) => ({ ...document, index }))
      .filter((document) => document.file);

    if (documentsToUpload.length === 0) {
      return [] as Array<{ type: string; filePath: string }>;
    }

    const unnamedDocument = documentsToUpload.find((document) => !document.name.trim());

    if (unnamedDocument) {
      throw new Error("Write a name for each additional document before submitting.");
    }

    void documentsToUpload;

    return [] as Array<{ type: string; filePath: string }>;
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

    if (missingRequiredDocuments.length > 0) {
      setError(`Upload ${missingRequiredDocuments.join(", ")} in Documents before submitting this service.`);
      return;
    }

    void parsed;
    void serviceId;
    void savedServiceDocuments;
    void uploadAdditionalDocuments;

    setError("Service requests are disabled.");
  };

  const renderSavedDocument = (documentType: PermanentDocumentType) => {
    const document = documentsByType.get(documentType) || null;

    return (
      <article key={documentType} className="rounded-2xl border border-[#e8dcc0] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#3b2f1c]">{getPermanentDocumentLabel(documentType)}</p>
            <p className="text-xs text-[#7a6a4f]">{getPermanentDocumentDescription(documentType)}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs ${
              document ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {document ? "Ready" : "Missing"}
          </span>
        </div>

        <div className="mt-4">
          {document ? (
            <p className="text-sm font-medium text-[#3b2f1c] break-words">{document.fileName}</p>
          ) : (
            <p className="text-sm text-[#7a6a4f]">Not uploaded in Documents</p>
          )}
        </div>

        <div className="mt-4">
          {document?.signedUrl ? (
            <a
              href={document.signedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-[#f5e6c8] px-3 py-2 text-sm text-[#6b5b3e] transition hover:bg-[#e8dcc0]"
            >
              View
            </a>
          ) : (
            <span className="inline-flex rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-600">
              View
            </span>
          )}
        </div>
      </article>
    );
  };

  const renderBankStatement = () => {
    const document = latestBankStatement;

    return (
      <article className="rounded-2xl border border-[#e8dcc0] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#3b2f1c]">Bank Statement</p>
            <p className="text-xs text-[#7a6a4f]">Latest uploaded year-wise bank statement</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs ${
              document ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {document ? "Ready" : "Missing"}
          </span>
        </div>

        <div className="mt-4">
          {document ? (
            <>
              <p className="text-sm font-medium text-[#3b2f1c] break-words">{document.fileName}</p>
              <p className="text-xs text-[#7a6a4f]">Year: {formatFinancialYear(document.documentYear)}</p>
            </>
          ) : (
            <p className="text-sm text-[#7a6a4f]">Not uploaded in Required Documents</p>
          )}
        </div>

        <div className="mt-4">
          {document?.signedUrl ? (
            <a
              href={document.signedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-[#f5e6c8] px-3 py-2 text-sm text-[#6b5b3e] transition hover:bg-[#e8dcc0]"
            >
              View
            </a>
          ) : (
            <span className="inline-flex rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-600">
              View
            </span>
          )}
        </div>
      </article>
    );
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
        <p className="text-sm uppercase tracking-[0.2em] text-[#7a6a4f]">{service.name}</p>
        <h1 className="text-3xl font-semibold text-[#3b2f1c]">Submit Your Request</h1>
        <p className="text-sm text-[#6b5b3e]">{service.description}</p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <input type="hidden" name="serviceId" value={serviceId} />

        <div className="grid gap-4 grid-cols-2">
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
              readOnly
              className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 uppercase text-[#3b2f1c]"
            />
          </label>

          <label className="space-y-2 text-sm text-[#6b5b3e]">
            Aadhaar
            <input
              value={form.aadhaar}
              readOnly
              className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 text-[#3b2f1c]"
            />
          </label>

          <label className="space-y-2 text-sm text-[#6b5b3e]">
            Account Number
            <input
              value={form.accountNumber}
              readOnly
              className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 text-[#3b2f1c]"
            />
          </label>

          <label className="space-y-2 text-sm text-[#6b5b3e]">
            GST Number (optional)
            <input
              value={form.gstNumber}
              readOnly
              className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 uppercase text-[#3b2f1c]"
            />
          </label>
        </div>

        <section className="rounded-2xl border border-[#e8dcc0] bg-[#fffaf0] p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#3b2f1c]">Saved Documents</h3>
            <p className="text-sm text-[#7a6a4f]">
              Documents are managed from the dashboard and are view-only here.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-3">
            {renderBankStatement()}
            {requiredPermanentDocumentTypes.map((documentType) => renderSavedDocument(documentType))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8dcc0] bg-white p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#3b2f1c]">Additional Documents</h3>
            <p className="text-sm text-[#7a6a4f]">
              Add up to three service-specific documents for this request.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-3">
            {additionalServiceDocuments.map((document, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-[#e8dcc0] bg-[#fffaf0] p-4">
                <label className="space-y-2 text-sm text-[#6b5b3e]">
                  Document name
                  <input
                    value={document.name}
                    onChange={(event) => onAdditionalDocumentChange(index, "name", event.target.value)}
                    placeholder={`Additional Document ${index + 1}`}
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
                  />
                </label>

                <label className="space-y-2 text-sm text-[#6b5b3e]">
                  File
                  <input
                    type="file"
                    onChange={(event) =>
                      onAdditionalDocumentChange(index, "file", event.target.files?.[0] ?? null)
                    }
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
                  />
                </label>

                {document.file ? (
                  <p className="text-xs text-[#7a6a4f] break-words">{document.file.name}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

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
