"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  getPermanentDocumentDescription,
  getPermanentDocumentLabel,
  maxPermanentDocumentSizeBytes,
  permanentDocumentTypes,
  requiredPermanentDocumentTypes,
  type PermanentDocumentType,
} from "../../lib/permanentDocumentTypes";

type PermanentDocumentNumbers = {
  aadharNumber: string;
  panNumber: string;
  accountNumber: string;
  gstNumber: string;
};

type PermanentDocumentItem = {
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
  documents?: PermanentDocumentItem[];
  numbers?: PermanentDocumentNumbers;
  message?: string;
};

const emptyNumbers: PermanentDocumentNumbers = {
  aadharNumber: "",
  panNumber: "",
  accountNumber: "",
  gstNumber: "",
};

const emptyPendingFiles = permanentDocumentTypes.reduce<Record<PermanentDocumentType, File | null>>(
  (accumulator, item) => {
    accumulator[item.type] = null;
    return accumulator;
  },
  {} as Record<PermanentDocumentType, File | null>
);

function formatFileSize(size: number): string {
  const megabytes = size / (1024 * 1024);
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function PermanentDocuments() {
  const [documents, setDocuments] = useState<PermanentDocumentItem[]>([]);
  const [numbers, setNumbers] = useState<PermanentDocumentNumbers>(emptyNumbers);
  const [pendingFiles, setPendingFiles] = useState<Record<PermanentDocumentType, File | null>>(
    emptyPendingFiles
  );
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<PermanentDocumentType | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"neutral" | "success" | "error">("neutral");
  const fileInputRefs = useRef<Record<PermanentDocumentType, HTMLInputElement | null>>(
    permanentDocumentTypes.reduce<Record<PermanentDocumentType, HTMLInputElement | null>>(
      (accumulator, item) => {
        accumulator[item.type] = null;
        return accumulator;
      },
      {} as Record<PermanentDocumentType, HTMLInputElement | null>
    )
  );

  const documentsByType = useMemo(() => {
    const map = new Map<PermanentDocumentType, PermanentDocumentItem>();

    for (const document of documents) {
      if (!map.has(document.documentType)) {
        map.set(document.documentType, document);
      }
    }

    return map;
  }, [documents]);

  const setFeedback = (tone: "neutral" | "success" | "error", text: string) => {
    setMessageTone(tone);
    setMessage(text);
  };

  const loadDocuments = async () => {
    setLoading(true);

    try {
      // Permanent documents API disabled
      const response = await fetch("/api/permanent-documents", { cache: "no-store" });
      const payload = (await response.json()) as PermanentDocumentsPayload;

      if (!response.ok) {
        throw new Error(payload.message || "Unable to load shared documents.");
      }

      setDocuments(payload.documents || []);
      setNumbers(payload.numbers || emptyNumbers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments().catch((error: unknown) => {
      setFeedback("error", getErrorMessage(error, "Unable to load shared documents."));
    });
  }, [reloadKey]);

  const onNumberChange = (name: keyof PermanentDocumentNumbers, value: string) => {
    setNumbers((previous) => ({ ...previous, [name]: value }));
  };

  const validateFile = (file: File | null): string | null => {
    if (!file) {
      return "Choose a file before updating this document.";
    }

    if (file.size > maxPermanentDocumentSizeBytes) {
      return `File size must be ${formatFileSize(maxPermanentDocumentSizeBytes)} or smaller.`;
    }

    return null;
  };

  const uploadDocument = async (documentType: PermanentDocumentType) => {
    const file = pendingFiles[documentType];
    const validationMessage = validateFile(file);

    if (validationMessage) {
      setFeedback("error", validationMessage);
      return;
    }

    setUploadingType(documentType);
    setMessage("");
    setMessageTone("neutral");

    try {
      const formData = new FormData();
      formData.append("file", file as File);
      formData.append("documentType", documentType);
      formData.append("aadharNumber", numbers.aadharNumber);
      formData.append("panNumber", numbers.panNumber);
      formData.append("accountNumber", numbers.accountNumber);
      formData.append("gstNumber", numbers.gstNumber);

      const response = await fetch("/api/uploads/permanent-document", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Unable to update shared document.");
      }

      setPendingFiles((previous) => ({ ...previous, [documentType]: null }));

      const input = fileInputRefs.current[documentType];
      if (input) {
        input.value = "";
      }

      setReloadKey((value) => value + 1);
      setFeedback("success", `${getPermanentDocumentLabel(documentType)} updated.`);
    } catch (error: unknown) {
      setFeedback("error", getErrorMessage(error, "Unable to update shared document."));
    } finally {
      setUploadingType(null);
    }
  };

  const saveDetails = async () => {
    if (documents.length === 0) {
      setFeedback("error", "Upload Aadhaar or PAN before saving details.");
      return;
    }

    setSavingDetails(true);
    setMessage("");
    setMessageTone("neutral");

    try {
      await Promise.all(
        documents.map(async (document) => {
          const response = await fetch("/api/permanent-documents", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentType: document.documentType,
              aadharNumber: numbers.aadharNumber,
              panNumber: numbers.panNumber,
              accountNumber: numbers.accountNumber,
              gstNumber: numbers.gstNumber,
            }),
          });
          const payload = (await response.json()) as { message?: string };

          if (!response.ok) {
            throw new Error(payload.message || "Unable to save document details.");
          }
        })
      );

      setReloadKey((value) => value + 1);
      setFeedback("success", "Shared details saved.");
    } catch (error: unknown) {
      setFeedback("error", getErrorMessage(error, "Unable to save document details."));
    } finally {
      setSavingDetails(false);
    }
  };

  const renderDocumentCard = (documentType: PermanentDocumentType) => {
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
            {document ? "Uploaded" : "Pending"}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {document ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2">
              <p className="text-sm font-medium text-green-800 break-words">{document.fileName}</p>
              <p className="text-xs text-green-700">
                Updated on {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#d9c9a4] bg-[#fffaf0] p-3">
              <p className="text-sm text-[#7a6a4f]">No file uploaded</p>
            </div>
          )}

          <input
            ref={(element) => {
              fileInputRefs.current[documentType] = element;
            }}
            type="file"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0] ?? null;
              setPendingFiles((previous) => ({ ...previous, [documentType]: file }));
            }}
            className="w-full rounded-xl border border-[#e5d7b6] bg-[#faf6ed] px-4 py-3 text-sm"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {document?.signedUrl ? (
            <a
              href={document.signedUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-[#f5e6c8] px-3 py-2 text-sm text-[#6b5b3e] transition hover:bg-[#e8dcc0]"
            >
              View
            </a>
          ) : (
            <span className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-600">View</span>
          )}

          <button
            type="button"
            disabled={uploadingType === documentType}
            onClick={() => {
              void uploadDocument(documentType);
            }}
            className="rounded-lg bg-[#3b2f1c] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2f2415] disabled:opacity-60"
          >
            {uploadingType === documentType ? "Updating..." : document ? "Update" : "Upload"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="dashboard-page dashboard-documents flex justify-center">
      <div className="dashboard-card-shell w-full max-w-6xl overflow-hidden rounded-3xl border border-[#e8dcc0] bg-white/80 shadow-xl backdrop-blur-md">
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]" />

        <div className="dashboard-page-body space-y-8 p-8">
          <div className="flex flex-row items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-semibold text-[#3b2f1c]">Shared Identity Documents</h2>
              <p className="text-sm text-[#7a6a4f]">
                Aadhaar, PAN, and saved numbers are reused across service forms.
              </p>
            </div>
            {loading ? <span className="text-sm text-[#7a6a4f]">Loading...</span> : null}
          </div>

          <div className="rounded-2xl border border-[#e8dcc0] bg-[#faf6ed] p-5">
            <div className="mb-5 flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-[#3b2f1c]">Saved Numbers</h3>
              <p className="text-sm text-[#7a6a4f]">
                These details are read-only on service forms and can be changed here.
              </p>
            </div>

            <div className="grid gap-4 grid-cols-2">
              <label className="space-y-2 text-sm text-[#6b5b3e]">
                Aadhaar Number
                <input
                  value={numbers.aadharNumber}
                  onChange={(event) => onNumberChange("aadharNumber", event.target.value)}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
                />
              </label>

              <label className="space-y-2 text-sm text-[#6b5b3e]">
                PAN Number
                <input
                  value={numbers.panNumber}
                  onChange={(event) => onNumberChange("panNumber", event.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 uppercase"
                />
              </label>

              <label className="space-y-2 text-sm text-[#6b5b3e]">
                Account Number
                <input
                  value={numbers.accountNumber}
                  onChange={(event) => onNumberChange("accountNumber", event.target.value)}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
                />
              </label>

              <label className="space-y-2 text-sm text-[#6b5b3e]">
                GST Number (if applicable)
                <input
                  value={numbers.gstNumber}
                  onChange={(event) => onNumberChange("gstNumber", event.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 uppercase"
                />
              </label>
            </div>

            <button
              type="button"
              disabled={savingDetails}
              onClick={() => {
                void saveDetails();
              }}
              className="mt-5 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.01] disabled:opacity-70"
            >
              {savingDetails ? "Saving..." : "Save Details"}
            </button>

            {message ? (
              <p
                className={`mt-4 rounded-xl border p-3 text-sm ${
                  messageTone === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : messageTone === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-[#e8dcc0] bg-white text-[#6b5b3e]"
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>

          <section className="rounded-2xl border border-[#e8dcc0] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-[#3b2f1c]">Shared Documents</h3>
              <p className="text-sm text-[#7a6a4f]">
                Bank Statement is now handled year-wise in Required Documents.
              </p>
            </div>

            <div className="grid gap-4 grid-cols-2">
              {requiredPermanentDocumentTypes.map((documentType) => renderDocumentCard(documentType))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
