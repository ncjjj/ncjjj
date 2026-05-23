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

export default function Documents() {
  type DocumentItem = {
    id: string;
    name: string;
    type: string;
    url: string | null;
    status: "Uploaded";
  };

  type DocumentsPayload = {
    documents?: Array<{
      id: string;
      fileName: string;
      documentType: string;
      signedUrl: string | null;
    }>;
  };

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>(documentTypes[0] ?? "");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unable to upload document.";
  };

  const loadDocuments = async () => {
    // Documents API disabled
    const response = await fetch("/api/documents");
    const payload = (await response.json()) as DocumentsPayload;

    if (response.ok) {
      setDocuments(
        (payload.documents || []).map((doc) => ({
          id: doc.id,
          name: doc.fileName,
          type: doc.documentType,
          url: doc.signedUrl,
          status: "Uploaded",
        }))
      );
    }
  };

  useEffect(() => {
    loadDocuments().catch(() => {
      setMessage("Unable to load uploaded documents.");
    });
  }, []);

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newFile) {
      setMessage("Choose a file before uploading.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      formData.append("documentType", documentType);

      const response = await fetch("/api/uploads/document", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        message?: string;
        id: string;
        fileName: string;
        documentType: string;
        documentSignedUrl: string | null;
      };

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to upload document.");
      }

      setDocuments((prev) => [
        {
          id: payload.id,
          name: payload.fileName,
          type: payload.documentType,
          url: payload.documentSignedUrl,
          status: "Uploaded",
        },
        ...prev,
      ]);

      setNewFile(null);
      setMessage("Document uploaded successfully.");
    } catch (error: unknown) {
      setMessage(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await fetch("/api/documents", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentId: id }),
    });

    if (response.ok) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setMessage("Document removed successfully.");
    } else {
      const payload = (await response.json()) as { message?: string };
      setMessage(payload?.message || "Unable to delete document.");
    }
  };

  return (
    <div className="dashboard-page dashboard-documents flex justify-center">

      {/* MAIN CARD */}
      <div className="dashboard-card-shell w-full max-w-5xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-[#e8dcc0] overflow-hidden">

        {/* TOP STRIP */}
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

        {/* CONTENT */}
        <div className="dashboard-page-body p-8 space-y-8">

          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">
              Documents
            </h2>
            <p className="text-sm text-[#7a6a4f]">
              Upload and manage your documents
            </p>
          </div>

          {/* UPLOAD SECTION */}
          <div className="dashboard-subcard bg-[#faf6ed] p-5 rounded-2xl border border-[#e8dcc0]">

            <h3 className="text-lg font-semibold text-[#3b2f1c] mb-4">
              Upload Document
            </h3>

            <form onSubmit={handleUpload} className="dashboard-form flex flex-row gap-3 items-center">

              <select
                value={documentType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setDocumentType(e.target.value)}
                className="dashboard-upload-control w-56 px-4 py-3 rounded-xl border border-[#e5d7b6] bg-white"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="file"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const selectedFile = e.target.files?.[0] ?? null;
                  setNewFile(selectedFile);
                }}
                className="dashboard-upload-control flex-1 px-4 py-3 rounded-xl border border-[#e5d7b6] bg-white"
              />

              <button
                type="submit"
                disabled={uploading}
                className="dashboard-upload-button px-6 py-3 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow hover:scale-[1.03] transition disabled:opacity-70"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>

            </form>

            <p className="mt-4 text-sm text-[#6b5b3e]">
              Available types: {documentTypes.join(", ")}
            </p>

            {message ? (
              <p className="mt-3 text-sm text-[#6b5b3e] bg-white rounded-xl border border-[#e8dcc0] p-3">
                {message}
              </p>
            ) : null}
          </div>

          <div className="dashboard-subcard bg-white p-5 rounded-2xl border border-[#e8dcc0] shadow-sm">

            <h3 className="text-lg font-semibold text-[#3b2f1c] mb-5">
              Uploaded Documents
            </h3>

            <div className="dashboard-list space-y-4">
              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9c9a4] p-6 text-center bg-[#fffaf0]">
                  <p className="text-sm font-medium text-[#3b2f1c]">No uploaded documents yet</p>
                  <p className="text-xs text-[#7a6a4f] mt-2">Upload a file to see it listed here.</p>
                </div>
              ) : null}

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="dashboard-document-row flex items-center justify-between p-4 rounded-2xl border border-[#e8dcc0] hover:bg-[#faf6ed] transition"
                >

                  {/* LEFT */}
                  <div className="dashboard-document-meta flex items-center gap-4">

                    {/* ICON */}
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white">
                      📄
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium text-[#3b2f1c] leading-tight">
                        {doc.name}
                      </p>
                      <p className="text-xs text-[#7a6a4f]">{doc.type}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === "Uploaded"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="dashboard-document-actions flex flex-wrap gap-2">

                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="dashboard-document-action px-3 py-2 rounded-lg bg-[#f5e6c8] text-[#6b5b3e] hover:bg-[#e8dcc0] transition text-sm"
                      >
                        View
                      </a>
                    ) : (
                      <span className="dashboard-document-action px-3 py-2 rounded-lg bg-gray-200 text-gray-600 cursor-not-allowed text-sm">
                        Unavailable
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="dashboard-document-action px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-sm"
                    >
                      Delete
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