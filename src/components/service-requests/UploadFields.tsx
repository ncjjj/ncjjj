"use client";

type UploadFieldsProps = {
  onFileChange: (name: string, file: File | null) => void;
  onAdditionalFilesChange: (files: File[]) => void;
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
  existingRequiredDocs,
}: UploadFieldsProps) {
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
        <input
          type="file"
          name="additionalDocuments"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(event) =>
            onAdditionalFilesChange(Array.from(event.target.files || []))
          }
          className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3"
        />
      </label>
    </div>
  );
}
