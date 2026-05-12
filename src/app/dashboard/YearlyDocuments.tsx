'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  getYearlyDocumentDescription,
  getYearlyDocumentLabel,
  getYearlyDocumentYears,
  maxYearlyDocumentSizeBytes,
  yearlyDocumentTypes,
  type YearlyDocumentSlot,
} from "../../lib/yearlyDocumentTypes";

type YearlyDocumentItem = {
  id: string;
  documentYear: number;
  documentSlot: YearlyDocumentSlot;
  fileName: string;
  filePath: string;
  signedUrl: string | null;
  mimeType: string | null;
  createdAt: string;
};

type YearlyDocumentsPayload = {
  documents?: YearlyDocumentItem[];
};

const emptyFiles = yearlyDocumentTypes.reduce<Record<YearlyDocumentSlot, File | null>>(
  (accumulator, item) => {
    accumulator[item.slot] = null;
    return accumulator;
  },
  {} as Record<YearlyDocumentSlot, File | null>
);

function formatFileSize(size: number): string {
  const megabytes = size / (1024 * 1024);

  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

function isAllowedFile(file: File): boolean {
  return file.type === "application/pdf" || file.type.startsWith("image/");
}

function groupByYear(documents: YearlyDocumentItem[]) {
  const grouped = new Map<number, Map<YearlyDocumentSlot, YearlyDocumentItem>>();

  for (const document of documents) {
    if (!grouped.has(document.documentYear)) {
      grouped.set(document.documentYear, new Map());
    }

    grouped.get(document.documentYear)?.set(document.documentSlot, document);
  }

  return Array.from(grouped.entries())
    .sort(([leftYear], [rightYear]) => rightYear - leftYear)
    .map(([documentYear, slots]) => ({
      documentYear,
      slots,
    }));
}

export default function YearlyDocuments() {
  const [documents, setDocuments] = useState<YearlyDocumentItem[]>([]);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [pendingFiles, setPendingFiles] = useState<Record<YearlyDocumentSlot, File | null>>(emptyFiles);
  const [loading, setLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<YearlyDocumentSlot | null>(null);
  const [replacingKey, setReplacingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"neutral" | "success" | "error">("neutral");
  const bulkInputRefs = useRef<Record<YearlyDocumentSlot, HTMLInputElement | null>>({
    bank_statement: null,
    document_2: null,
    document_3: null,
  });
  const replaceInputsRef = useRef<Record<YearlyDocumentSlot, HTMLInputElement | null>>({
    bank_statement: null,
    document_2: null,
    document_3: null,
  });

  const availableYears = useMemo(() => getYearlyDocumentYears(), []);
  const groupedDocuments = useMemo(() => groupByYear(documents), [documents]);

  const resetMessage = () => {
    setMessage("");
    setMessageTone("neutral");
  };

  const setFeedback = (tone: "neutral" | "success" | "error", text: string) => {
    setMessageTone(tone);
    setMessage(text);
  };

  const loadDocuments = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/yearly-documents", { cache: "no-store" });
      const payload = (await response.json()) as YearlyDocumentsPayload & { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Unable to load yearly documents.");
      }

      setDocuments(payload.documents || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments().catch((error: unknown) => {
      const text = error instanceof Error ? error.message : "Unable to load yearly documents.";
      setFeedback("error", text);
    });
  }, []);

  const validateFile = (file: File | null): string | null => {
    if (!file) {
      return null;
    }

    if (!isAllowedFile(file)) {
      return "Only PDF and image files are allowed.";
    }

    if (file.size > maxYearlyDocumentSizeBytes) {
      return `File size must be ${formatFileSize(maxYearlyDocumentSizeBytes)} or smaller.`;
    }

    return null;
  };

  const uploadDocument = async (year: number, slot: YearlyDocumentSlot, file: File) => {
    const validationMessage = validateFile(file);

    if (validationMessage) {
      throw new Error(validationMessage);
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("year", String(year));
    formData.append("documentSlot", slot);

    const response = await fetch("/api/uploads/yearly-document", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      throw new Error(payload.message || "Unable to upload document.");
    }
  };

  const getSelectedYearDocument = (slot: YearlyDocumentSlot): YearlyDocumentItem | null => {
    const year = Number.parseInt(selectedYear, 10);

    return documents.find((item) => item.documentYear === year && item.documentSlot === slot) || null;
  };

  const handleSingleUpload = async (slot: YearlyDocumentSlot) => {
    const year = Number.parseInt(selectedYear, 10);
    const file = pendingFiles[slot];

    if (!file) {
      setFeedback("error", `Choose a file for ${getYearlyDocumentLabel(slot)} before uploading.`);
      return;
    }

    setUploadingSlot(slot);
    resetMessage();

    try {
      await uploadDocument(year, slot, file);

      setPendingFiles((previous) => ({
        ...previous,
        [slot]: null,
      }));

      const input = bulkInputRefs.current[slot];

      if (input) {
        input.value = "";
      }

      await loadDocuments();
      setFeedback("success", `${getYearlyDocumentLabel(slot)} uploaded for ${year}.`);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "Unable to upload document.";
      setFeedback("error", text);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleFileChange = (slot: YearlyDocumentSlot, file: File | null) => {
    setPendingFiles((previous) => ({
      ...previous,
      [slot]: file,
    }));
  };

  const handleReplace = async (year: number, slot: YearlyDocumentSlot, file: File | null) => {
    if (!file) {
      return;
    }

    const validationMessage = validateFile(file);

    if (validationMessage) {
      setFeedback("error", validationMessage);
      return;
    }

    const actionKey = `${year}-${slot}`;
    setReplacingKey(actionKey);
    resetMessage();

    try {
      await uploadDocument(year, slot, file);
      await loadDocuments();
      setFeedback("success", `${getYearlyDocumentLabel(slot)} replaced for ${year}.`);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "Unable to replace document.";
      setFeedback("error", text);
    } finally {
      setReplacingKey(null);

      const input = replaceInputsRef.current[slot];

      if (input) {
        input.value = "";
      }
    }
  };

  const documentYear = Number.parseInt(selectedYear, 10);

  return (
    <div className="dashboard-page dashboard-documents flex justify-center">
      <div className="dashboard-card-shell w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-[#e8dcc0] overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

        <div className="dashboard-page-body p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">Required Documents</h2>
            <p className="text-sm text-[#7a6a4f]">
              Upload, replace, and review the 3 required documents for each financial year.
            </p>
          </div>

          <div className="dashboard-subcard bg-[#faf6ed] p-5 rounded-2xl border border-[#e8dcc0]">
            <div className="flex flex-col gap-2 mb-5">
                <h3 className="text-lg font-semibold text-[#3b2f1c]">Upload Required Documents</h3>
              <p className="text-sm text-[#7a6a4f]">
                Select a year and upload any combination of the required documents. PDF and image files only, up to {formatFileSize(maxYearlyDocumentSizeBytes)} each.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[180px_repeat(3,minmax(0,1fr))] items-start">
                <label className="space-y-2">
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6a4f]">
                    Year
                  </span>
                  <select
                    value={selectedYear}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedYear(event.target.value)}
                    className="dashboard-upload-control w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-white"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>

                {yearlyDocumentTypes.map((item) => {
                  const currentDocument = getSelectedYearDocument(item.slot);

                  return (
                    <div key={item.slot} className="space-y-2 rounded-xl border border-[#e8dcc0] bg-white p-3">
                      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6a4f]">
                        {item.label}
                      </span>
                      <input
                        ref={(element) => {
                          bulkInputRefs.current[item.slot] = element;
                        }}
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const file = event.target.files?.[0] ?? null;
                          handleFileChange(item.slot, file);
                        }}
                        className="dashboard-upload-control w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
                      />

                      <button
                        type="button"
                        disabled={uploadingSlot === item.slot}
                        onClick={() => {
                          void handleSingleUpload(item.slot);
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow hover:scale-[1.01] transition disabled:opacity-70 text-sm"
                      >
                        {uploadingSlot === item.slot ? "Uploading..." : `Upload ${item.label}`}
                      </button>

                      <p className="text-xs text-[#7a6a4f]">
                        {getYearlyDocumentDescription(item.slot)}
                      </p>

                      {currentDocument ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                          <p className="text-xs font-medium text-green-700 break-words">
                            Uploaded: {currentDocument.fileName}
                          </p>
                          {currentDocument.signedUrl ? (
                            <a
                              href={currentDocument.signedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-green-700 underline"
                            >
                              View file
                            </a>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          Not Uploaded
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs text-[#7a6a4f]">
                  Year selected: {documentYear}
                </p>
              </div>
            </div>

            {message ? (
              <p
                className={`mt-4 text-sm rounded-xl border p-3 ${
                  messageTone === "error"
                    ? "text-red-700 bg-red-50 border-red-200"
                    : messageTone === "success"
                      ? "text-green-700 bg-green-50 border-green-200"
                      : "text-[#6b5b3e] bg-white border-[#e8dcc0]"
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>

          <div className="dashboard-subcard bg-white p-5 rounded-2xl border border-[#e8dcc0] shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-[#3b2f1c]">Required Documents by Year</h3>
                <p className="text-sm text-[#7a6a4f]">Each year keeps one slot per required document.</p>
              </div>
              {loading ? <span className="text-sm text-[#7a6a4f]">Loading...</span> : null}
            </div>

            <div className="space-y-6">
              {!loading && groupedDocuments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9c9a4] p-6 text-center bg-[#fffaf0]">
                  <p className="text-sm font-medium text-[#3b2f1c]">No yearly documents yet</p>
                  <p className="text-xs text-[#7a6a4f] mt-2">Upload the first year to get started.</p>
                </div>
              ) : null}

              {groupedDocuments.map(({ documentYear, slots }) => (
                <section key={documentYear} className="rounded-2xl border border-[#e8dcc0] bg-[#fffdf8] p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <div>
                      <h4 className="text-base font-semibold text-[#3b2f1c]">Year: {documentYear}</h4>
                      <p className="text-xs text-[#7a6a4f]">View or replace any of the 3 required documents.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {yearlyDocumentTypes.map((item) => {
                      const document = slots.get(item.slot);

                      return (
                        <article
                          key={`${documentYear}-${item.slot}`}
                          className="rounded-2xl border border-[#e8dcc0] bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#3b2f1c]">{item.label}</p>
                              <p className="text-xs text-[#7a6a4f]">{item.description}</p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                document ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {document ? "Uploaded" : "Not Uploaded"}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2">
                            {document ? (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-[#3b2f1c] break-words">{document.fileName}</p>
                                <p className="text-xs text-[#7a6a4f]">Uploaded on {new Date(document.createdAt).toLocaleDateString()}</p>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-[#d9c9a4] p-3 bg-[#fffaf0]">
                                <p className="text-sm text-[#7a6a4f]">Not Uploaded</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {document?.signedUrl ? (
                              <a
                                href={document.signedUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-lg bg-[#f5e6c8] text-[#6b5b3e] hover:bg-[#e8dcc0] transition text-sm"
                              >
                                View
                              </a>
                            ) : (
                              <span className="px-3 py-2 rounded-lg bg-gray-200 text-gray-600 text-sm cursor-not-allowed">
                                View
                              </span>
                            )}

                            <button
                              type="button"
                              disabled={replacingKey === `${documentYear}-${item.slot}`}
                              onClick={() => replaceInputsRef.current[item.slot]?.click()}
                              className="px-3 py-2 rounded-lg bg-[#3b2f1c] text-white hover:bg-[#2f2415] transition text-sm disabled:opacity-60"
                            >
                              {replacingKey === `${documentYear}-${item.slot}` ? "Replacing..." : "Replace"}
                            </button>

                            <input
                              ref={(element) => {
                                replaceInputsRef.current[item.slot] = element;
                              }}
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const file = event.target.files?.[0] ?? null;
                                void handleReplace(documentYear, item.slot, file);
                              }}
                            />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
