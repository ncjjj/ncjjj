"use client";

import { useState } from "react";

type UploadedAdditionalFile = {
  file: File;
  description: string;
};

type UploadFieldsProps = {
  onFileChange: (name: string, file: File | null) => void;
  onAdditionalFilesChange: (files: File[]) => void;
  onAdditionalFilesWithDescChange?: (files: UploadedAdditionalFile[]) => void;
  existingRequiredDocs?: {
    panCard?: { fileName?: string; signedUrl?: string | null } | null;
    aadhaarCard?: { fileName?: string; signedUrl?: string | null } | null;
    photo?: { fileName?: string; signedUrl?: string | null } | null;
    signature?: { fileName?: string; signedUrl?: string | null } | null;
  };
};

export default function UploadFields({
  onFileChange,
  onAdditionalFilesChange,
  onAdditionalFilesWithDescChange,
  existingRequiredDocs,
}: UploadFieldsProps) {
  const [additionalFilesWithDesc, setAdditionalFilesWithDesc] = useState<UploadedAdditionalFile[]>([]);
  return (
    <div className="space-y-4 rounded-2xl border border-[#e8dcc0] bg-[#fffaf0] p-5">
      <h3 className="text-lg font-semibold text-[#3b2f1c]">Required Documents</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-[#6b5b3e]">
          PAN Card (PDF/JPG/PNG)
          {existingRequiredDocs?.panCard ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
              Prefilled: {existingRequiredDocs.panCard.fileName || "PAN Card"}
              {existingRequiredDocs.panCard.signedUrl ? (
                <a
                  href={existingRequiredDocs.panCard.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 underline"
                >
                  View
                </a>
              ) : null}
            </div>
          ) : null}
          <input
            type="file"
            name="panCard"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => onFileChange("panCard", event.target.files?.[0] || null)}
            className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
          />
        </label>

        <label className="space-y-2 text-sm text-[#6b5b3e]">
          Aadhaar Card (PDF/JPG/PNG)
          {existingRequiredDocs?.aadhaarCard ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
              Prefilled: {existingRequiredDocs.aadhaarCard.fileName || "Aadhaar Card"}
              {existingRequiredDocs.aadhaarCard.signedUrl ? (
                <a
                  href={existingRequiredDocs.aadhaarCard.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 underline"
                >
                  View
                </a>
              ) : null}
            </div>
          ) : null}
          <input
            type="file"
            name="aadhaarCard"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => onFileChange("aadhaarCard", event.target.files?.[0] || null)}
            className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
          />
        </label>

        <label className="space-y-2 text-sm text-[#6b5b3e]">
          Photo (JPG/PNG)
          {existingRequiredDocs?.photo ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
              Prefilled: {existingRequiredDocs.photo.fileName || "Photo"}
              {existingRequiredDocs.photo.signedUrl ? (
                <a
                  href={existingRequiredDocs.photo.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 underline"
                >
                  View
                </a>
              ) : null}
            </div>
          ) : null}
          <input
            type="file"
            name="photo"
            accept=".jpg,.jpeg,.png"
            onChange={(event) => onFileChange("photo", event.target.files?.[0] || null)}
            className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
          />
        </label>

        <label className="space-y-2 text-sm text-[#6b5b3e]">
          Signature (JPG/PNG)
          {existingRequiredDocs?.signature ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
              Prefilled: {existingRequiredDocs.signature.fileName || "Signature"}
              {existingRequiredDocs.signature.signedUrl ? (
                <a
                  href={existingRequiredDocs.signature.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 underline"
                >
                  View
                </a>
              ) : null}
            </div>
          ) : null}
          <input
            type="file"
            name="signature"
            accept=".jpg,.jpeg,.png"
            onChange={(event) => onFileChange("signature", event.target.files?.[0] || null)}
            className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-[#6b5b3e]">
        Additional Documents (optional)
        <p className="text-xs text-[#6b5b3e] mb-2">Accepts any file type: PDF, images, documents, archives, etc.</p>
        <input
          type="file"
          name="additionalDocuments"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            onAdditionalFilesChange(files);
            
            // Add files with empty descriptions
            const newFiles = files.map(file => ({
              file,
              description: "",
            }));
            setAdditionalFilesWithDesc(prev => [...prev, ...newFiles]);
            
            if (onAdditionalFilesWithDescChange) {
              onAdditionalFilesWithDescChange([...additionalFilesWithDesc, ...newFiles]);
            }
          }}
          className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
        />
      </label>

      {/* Display uploaded additional documents with descriptions */}
      {additionalFilesWithDesc.length > 0 && (
        <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-900">Uploaded Additional Documents</h4>
          {additionalFilesWithDesc.map((item, idx) => (
            <div key={idx} className="space-y-2 rounded-lg bg-white p-3 border border-blue-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#3b2f1c]">{item.file.name}</p>
                  <p className="text-xs text-[#7a6a4f]">{(item.file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = additionalFilesWithDesc.filter((_, i) => i !== idx);
                    setAdditionalFilesWithDesc(updated);
                    onAdditionalFilesChange(updated.map(f => f.file));
                    if (onAdditionalFilesWithDescChange) {
                      onAdditionalFilesWithDescChange(updated);
                    }
                  }}
                  className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="What is this document? (e.g., GST Certificate, Bank Statement)"
                value={item.description}
                onChange={(e) => {
                  const updated = additionalFilesWithDesc.map((f, i) =>
                    i === idx ? { ...f, description: e.target.value } : f
                  );
                  setAdditionalFilesWithDesc(updated);
                  if (onAdditionalFilesWithDescChange) {
                    onAdditionalFilesWithDescChange(updated);
                  }
                }}
                className="w-full text-sm px-3 py-2 rounded-lg border border-[#e5d7b6] bg-[#faf6ed]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
