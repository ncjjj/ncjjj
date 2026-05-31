"use client";

import { useEffect, useState } from "react";
import { getFinancialYearLabel, getFinancialYearOptions } from "../../lib/yearlyDocumentTypes";

type ServiceDocument = {
  id: string;
  fileName: string;
  documentName: string;
  financialYear: string | null;
  createdAt: string;
  viewUrl: string | null;
};

type Props = {
  serviceKey: string;
  serviceLabel: string;
  sectionKey: string;
  sectionLabel: string;
  requiresFinancialYear?: boolean;
};

type UploadRow = {
  id: string;
  documentName: string;
  financialYear: string;
  file: File | null;
};

type MessageState = {
  type: "success" | "error" | "";
  text: string;
};

function createUploadRow(defaultFinancialYear: string): UploadRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    documentName: "",
    financialYear: defaultFinancialYear,
    file: null,
  };
}

export default function ServiceDocumentManager({
  serviceKey,
  serviceLabel,
  sectionKey,
  sectionLabel,
  requiresFinancialYear,
}: Props) {
  const defaultFinancialYear = requiresFinancialYear ? getFinancialYearLabel() : "";
  const [financialYearOptions, setFinancialYearOptions] = useState<string[]>([]);
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([createUploadRow(defaultFinancialYear)]);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState<MessageState>({ type: "", text: "" });

  useEffect(() => {
    setFinancialYearOptions(getFinancialYearOptions().map((item) => item.label));
  }, []);

  useEffect(() => {
    setUploadRows([createUploadRow(defaultFinancialYear)]);
  }, [defaultFinancialYear, serviceKey, sectionKey]);

  useEffect(() => {
    let active = true;

    const loadDocuments = async () => {
      setLoading(true);

      try {
        const searchParams = new URLSearchParams({ typeKey: `${serviceKey}:${sectionKey}` });
        const response = await fetch(`/api/service-documents?${searchParams.toString()}`, { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
          documents?: ServiceDocument[];
        } | null;

        if (!response.ok) {
          if (active) {
            setMessage({ type: "error", text: payload?.message || "Unable to load documents." });
            setDocuments([]);
          }
          return;
        }

        if (active) {
          setDocuments(payload?.documents || []);
        }
      } catch {
        if (active) {
          setMessage({ type: "error", text: "Unable to load documents right now." });
          setDocuments([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDocuments();

    return () => {
      active = false;
    };
  }, [serviceKey, sectionKey, reloadKey]);

  const addUploadRow = () => {
    setUploadRows((previous) => [...previous, createUploadRow(defaultFinancialYear)]);
  };

  const updateUploadRow = (rowId: string, patch: Partial<UploadRow>) => {
    setUploadRows((previous) => previous.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  const removeUploadRow = (rowId: string) => {
    setUploadRows((previous) => {
      if (previous.length === 1) {
        return [createUploadRow(defaultFinancialYear)];
      }

      return previous.filter((row) => row.id !== rowId);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const rowsToUpload = uploadRows.filter((row) => row.file);

    if (rowsToUpload.length === 0) {
      setMessage({ type: "error", text: "Please choose at least one document file before submit." });
      return;
    }

    setSubmitting(true);

    try {
      for (const row of rowsToUpload) {
        const formData = new FormData();
        formData.append("file", row.file as File);
        formData.append("typeKey", `${serviceKey}:${sectionKey}`);
        formData.append("documentName", row.documentName.trim() || sectionLabel);

        if (row.financialYear) {
          formData.append("financialYear", row.financialYear);
        }

        const response = await fetch("/api/uploads/service-document", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to upload document.");
        }
      }

      setMessage({ type: "success", text: "Document uploaded successfully." });
      setUploadRows([createUploadRow(defaultFinancialYear)]);
      setReloadKey((value) => value + 1);
    } catch {
      setMessage({ type: "error", text: "Unable to upload document right now." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    setMessage({ type: "", text: "" });
    setDeletingId(documentId);

    try {
      const response = await fetch("/api/service-documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setMessage({ type: "error", text: payload?.message || "Unable to delete document." });
        return;
      }

      setMessage({ type: "success", text: "Document deleted successfully." });
      setReloadKey((value) => value + 1);
    } catch {
      setMessage({ type: "error", text: "Unable to delete document right now." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setUploadRows([createUploadRow(defaultFinancialYear)]);
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e9dbc0] bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#2f2310]">{serviceLabel}</h1>
        <p className="mt-1 text-sm text-[#7a6a4f]">{sectionLabel}</p>
      </div>

      {message.text ? (
        <p
          className={`rounded-xl p-3 text-sm ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[#e9dbc0] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#2f2310]">Upload Documents</h2>
            <p className="text-sm text-[#7a6a4f]">Click the plus icon to add another file upload row.</p>
          </div>
          <button
            type="button"
            onClick={addUploadRow}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7c8a7] bg-white text-xl font-semibold text-[#5f4c2b] shadow-sm transition hover:bg-[#fbf4e7]"
            aria-label="Add another document upload row"
            title="Add another document"
          >
            +
          </button>
        </div>

        <div className="grid gap-4">
          {uploadRows.map((row, index) => (
            <section key={row.id} className="rounded-2xl border border-[#e9dbc0] bg-[#fffdf9] p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#4a3a22]">Document {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeUploadRow(row.id)}
                  className="rounded-lg border border-[#e2d3b2] bg-white px-3 py-1.5 text-xs font-semibold text-[#5f4c2b] hover:bg-[#fbf4e7]"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#4a3a22]" htmlFor={`service-document-name-${row.id}`}>
                    Document Name
                  </label>
                  <input
                    id={`service-document-name-${row.id}`}
                    value={row.documentName}
                    onChange={(event) => updateUploadRow(row.id, { documentName: event.target.value })}
                    className="rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    placeholder="Enter your document name"
                    required
                  />
                </div>

                {requiresFinancialYear ? (
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#4a3a22]" htmlFor={`service-financial-year-${row.id}`}>
                      Financial Year
                    </label>
                    <select
                      id={`service-financial-year-${row.id}`}
                      value={row.financialYear}
                      onChange={(event) => updateUploadRow(row.id, { financialYear: event.target.value })}
                      className="rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                      required
                    >
                      <option value="">Select Financial Year</option>
                      {financialYearOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-2">
                <label className="text-sm font-semibold text-[#4a3a22]" htmlFor={`service-upload-file-${row.id}`}>
                  Upload Document
                </label>
                <input
                  id={`service-upload-file-${row.id}`}
                  type="file"
                  onChange={(event) => updateUploadRow(row.id, { file: event.target.files?.[0] || null })}
                  className="rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                  required
                />
              </div>
            </section>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#5f4c2b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit All"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-[#d7c8a7] bg-white px-5 py-3 text-sm font-semibold text-[#5f4c2b] hover:bg-[#fbf4e7]"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-[#e9dbc0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#2f2310]">Uploaded Documents</h2>

        {loading ? (
          <p className="mt-3 text-sm text-[#7a6a4f]">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="mt-3 text-sm text-[#7a6a4f]">No document uploaded yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[680px] divide-y divide-[#eadfc7] text-sm">
              <thead>
                <tr className="text-left text-[#8a7340]">
                  <th className="py-3 pr-4">Document Name</th>
                  <th className="py-3 pr-4">File</th>
                  <th className="py-3 pr-4">Financial Year</th>
                  <th className="py-3 pr-4">Uploaded</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6d3]">
                {documents.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4">{item.documentName}</td>
                    <td className="py-3 pr-4">{item.fileName}</td>
                    <td className="py-3 pr-4">{item.financialYear || "-"}</td>
                    <td className="py-3 pr-4">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        {item.viewUrl ? (
                          <a
                            href={item.viewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-[#d7c8a7] bg-[#fbf4e7] px-3 py-2 text-xs font-semibold text-[#5f4c2b]"
                          >
                            View
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-70"
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
