'use client';

import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

const documentTypes = [
  "Aadhaar Card",
  "PAN Card",
  "Passport Size Photo",
  "Signature",
  "Driving License",
  "Voter ID",
  "Utility Bill",
  "GST Certificate",
  "Bank Statement",
];

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  url: string | null;
  status: "Uploaded";
};

type DocumentsPayload = {
  message?: string;
  documents?: Array<{
    id: string;
    fileName: string;
    documentType: string;
    signedUrl: string | null;
  }>;
};

type MessageState = {
  text: string;
  tone: "neutral" | "success" | "error";
};

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState<MessageState>({ text: "", tone: "neutral" });

  const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : "Unable to upload document.";

  useEffect(() => {
    let active = true;

    const loadDocuments = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/documents", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as DocumentsPayload | null;

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load uploaded documents.");
        }

        if (active) {
          setDocuments(
            (payload?.documents || []).map((doc) => ({
              id: doc.id,
              name: doc.fileName,
              type: doc.documentType,
              url: doc.signedUrl,
              status: "Uploaded",
            }))
          );
        }
      } catch {
        if (active) {
          setDocuments([]);
          setMessage({ text: "Unable to load uploaded documents.", tone: "error" });
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
  }, [reloadKey]);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newFile) {
      setMessage({ text: "Choose a file before uploading.", tone: "error" });
      return;
    }

    setUploading(true);
    setMessage({ text: "", tone: "neutral" });

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      formData.append("documentType", documentType);

      const response = await fetch("/api/uploads/document", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to upload document.");
      }

      setNewFile(null);
      setDocumentType("");
      setMessage({ text: "Document uploaded successfully.", tone: "success" });
      setReloadKey((value) => value + 1);
    } catch (error: unknown) {
      setMessage({ text: getErrorMessage(error), tone: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setMessage({ text: "", tone: "neutral" });

    try {
      const response = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setMessage({ text: payload?.message || "Unable to delete document.", tone: "error" });
        return;
      }

      setMessage({ text: "Document removed successfully.", tone: "success" });
      setReloadKey((value) => value + 1);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard-page dashboard-documents flex justify-center">
      <div className="dashboard-card-shell w-full max-w-5xl overflow-hidden rounded-3xl border border-[#e8dcc0] bg-white shadow-xl">
        <div className="h-24 bg-gradient-to-r from-[#f7f2e8] via-[#fbf7f0] to-[#ffffff]" />

        <div className="dashboard-page-body space-y-8 p-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">Documents</h2>
            <p className="text-sm text-[#7a6a4f]">Upload and manage your documents</p>
          </div>

          <div className="dashboard-subcard rounded-2xl border border-[#e8dcc0] bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-[#3b2f1c]">Upload Document</h3>

            <form onSubmit={handleUpload} className="dashboard-form flex flex-col gap-3 md:flex-row md:items-center">
              <select
                value={documentType}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => setDocumentType(event.target.value)}
                className="dashboard-upload-control w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 md:w-56"
                required
              >
                <option value="">Select document type</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="file"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setNewFile(event.target.files?.[0] ?? null);
                }}
                className="dashboard-upload-control flex-1 rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
                required
              />

              <button
                type="submit"
                disabled={uploading}
                className="dashboard-upload-button rounded-xl border border-[#d7c8a7] bg-white px-6 py-3 font-semibold text-[#5f4c2b] shadow transition hover:bg-[#fbf4e7] disabled:opacity-70"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>

            <p className="mt-4 text-sm text-[#6b5b3e]">Available types: {documentTypes.join(", ")}</p>

            {message.text ? (
              <p
                className={`mt-3 rounded-xl border p-3 text-sm ${
                  message.tone === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : message.tone === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-[#e8dcc0] bg-white text-[#6b5b3e]"
                }`}
              >
                {message.text}
              </p>
            ) : null}
          </div>

          <div className="dashboard-subcard rounded-2xl border border-[#e8dcc0] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#3b2f1c]">Uploaded Documents</h3>
              {loading ? <span className="text-sm text-[#7a6a4f]">Loading...</span> : null}
            </div>

            <div className="dashboard-list space-y-4">
              {!loading && documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9c9a4] bg-white p-6 text-center">
                  <p className="text-sm font-medium text-[#3b2f1c]">No uploaded documents yet</p>
                  <p className="mt-2 text-xs text-[#7a6a4f]">Upload a file to see it listed here.</p>
                </div>
              ) : null}

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="dashboard-document-row flex items-center justify-between rounded-2xl border border-[#e8dcc0] bg-white p-4 transition hover:bg-[#faf6ed]"
                >
                  <div className="dashboard-document-meta flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white">
                      📄
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium leading-tight text-[#3b2f1c]">{doc.name}</p>
                      <p className="text-xs text-[#7a6a4f]">{doc.type}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          doc.status === "Uploaded"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  </div>

                  <div className="dashboard-document-actions flex flex-wrap gap-2">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="dashboard-document-action rounded-lg border border-[#d7c8a7] bg-white px-3 py-2 text-sm text-[#6b5b3e] transition hover:bg-[#fbf4e7]"
                      >
                        View
                      </a>
                    ) : (
                      <span className="dashboard-document-action cursor-not-allowed rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                        Unavailable
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="dashboard-document-action rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-70"
                    >
                      {deletingId === doc.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}