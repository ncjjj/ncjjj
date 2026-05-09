"use client";

import { useEffect, useState } from "react";
import type { AdminDocumentUserGroup, AdminDocumentView } from "../../types/domain";

type Props = { userId: string };

export default function UserDocumentsViewer({ userId }: Props) {
  const [group, setGroup] = useState<AdminDocumentUserGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextOffsets, setNextOffsets] = useState<{ yearly: number | null; permanent: number | null }>({ yearly: null, permanent: null });

  const fetchPage = async (opts: { category?: "all" | "yearly" | "permanent"; offset?: number; append?: boolean; limit?: number } = {}) => {
    setLoading(true);
    try {
      const category = opts.category || "all";
      const limit = opts.limit ?? 20;
      const offset = typeof opts.offset === "number" ? opts.offset : 0;

      const url = new URL(`/api/admin/user-documents`, window.location.origin);
      url.searchParams.set("userId", userId);
      url.searchParams.set("category", category);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("offset", String(offset));

      const res = await fetch(url.toString(), { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || "Unable to load documents");

      const incoming = {
        userId: payload.user?.id || userId,
        userName: payload.user?.name || "(unknown)",
        userEmail: payload.user?.email || "",
        userPhone: payload.user?.mobileNumber || "",
        documents: payload.documents || [],
      } as AdminDocumentUserGroup;

      setNextOffsets({ yearly: payload.nextOffsets?.yearly ?? null, permanent: payload.nextOffsets?.permanent ?? null });

      if (opts.append && group) {
        setGroup({ ...group, documents: [...group.documents, ...incoming.documents] });
      } else {
        setGroup(incoming);
      }
    } catch (err) {
      console.error("Unable to load user documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage({ limit: 20, offset: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!group) return <p className="text-sm text-[#6b7280]">Loading documents...</p>;

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#111827]">{group.userName}</h3>
          <p className="text-xs text-[#6b7280]">{group.userEmail} · {group.userPhone}</p>
        </div>
        <span className="text-xs font-semibold uppercase text-[#6b7280]">{group.documents.length} documents</span>
      </div>

      <div className="mt-4 space-y-4">
        {group.documents.filter((d) => d.documentCategory === "permanent").length > 0 && (
          <div>
            <h4 className="mb-2 font-semibold">Permanent Documents</h4>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.documents
                .filter((d) => d.documentCategory === "permanent")
                .map((document) => (
                  <div key={document.id || document.filePath} className="rounded-lg border border-[#d1d5db] bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[#111827]">{document.documentType}</p>
                        <p className="text-xs text-[#6b7280] capitalize">{document.documentCategory}</p>
                      </div>
                      <span className="text-[11px] rounded-full bg-[#f3f4f6] px-2 py-1 text-[#4b5563]">-</span>
                    </div>

                    <p className="mt-2 text-xs text-[#6b7280]">File: {document.fileName}</p>

                    {document.signedUrl ? (
                      <a href={document.signedUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg border border-[#d1d5db] bg-[#111827] px-3 py-1.5 text-xs font-medium text-white">View Document</a>
                    ) : (
                      <span className="mt-3 inline-flex rounded-lg border border-[#d1d5db] bg-[#f3f4f6] px-3 py-1.5 text-xs text-[#6b7280]">No preview available</span>
                    )}
                  </div>
                ))}
            </div>
            {nextOffsets.permanent ? (
              <div className="mt-3 text-center">
                <button className="rounded-lg border border-[#111827] bg-white px-3 py-2 text-sm" onClick={() => fetchPage({ category: "permanent", append: true, offset: nextOffsets.permanent ?? 0 })} disabled={loading}>
                  {loading ? "Loading..." : "Load more permanent documents"}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {(() => {
          const yearlyDocs = group.documents.filter((d) => d.documentCategory === "yearly");
          if (yearlyDocs.length === 0) return null;
          const byYear = yearlyDocs.reduce<Record<string, typeof yearlyDocs>>((acc, doc) => {
            const key = doc.documentYear ? String(doc.documentYear) : "unknown";
            if (!acc[key]) acc[key] = [];
            acc[key].push(doc);
            return acc;
          }, {} as Record<string, typeof yearlyDocs>);

          return Object.keys(byYear).map((yearKey) => (
            <div key={yearKey}>
              {yearKey !== "unknown" ? <h4 className="mb-2 font-semibold">{yearKey}</h4> : null}
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(byYear[yearKey] || []).map((document) => (
                  <div key={document.id || document.filePath} className="rounded-lg border border-[#d1d5db] bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[#111827]">{document.documentType}</p>
                        <p className="text-xs text-[#6b7280] capitalize">{document.documentCategory}</p>
                      </div>
                      <span className="text-[11px] rounded-full bg-[#f3f4f6] px-2 py-1 text-[#4b5563]">{document.documentYear ?? "-"}</span>
                    </div>

                    <p className="mt-2 text-xs text-[#6b7280]">File: {document.fileName}</p>
                    <p className="text-xs text-[#6b7280]">Slot: {document.documentSlot || "-"}</p>

                    {document.signedUrl ? (
                      <a href={document.signedUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg border border-[#d1d5db] bg-[#111827] px-3 py-1.5 text-xs font-medium text-white">View Document</a>
                    ) : (
                      <span className="mt-3 inline-flex rounded-lg border border-[#d1d5db] bg-[#f3f4f6] px-3 py-1.5 text-xs text-[#6b7280]">No preview available</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}

        {group.documents.filter((d) => d.documentCategory === "general").length > 0 && (
          <div>
            <h4 className="mb-2 font-semibold">Other Documents</h4>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.documents.filter((d) => d.documentCategory === "general").map((document) => (
                <div key={document.id || document.filePath} className="rounded-lg border border-[#d1d5db] bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-[#111827]">{document.documentType}</p>
                      <p className="text-xs text-[#6b7280] capitalize">{document.documentCategory}</p>
                    </div>
                    <span className="text-[11px] rounded-full bg-[#f3f4f6] px-2 py-1 text-[#4b5563]">-</span>
                  </div>

                  <p className="mt-2 text-xs text-[#6b7280]">File: {document.fileName}</p>

                  {document.signedUrl ? (
                    <a href={document.signedUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg border border-[#d1d5db] bg-[#111827] px-3 py-1.5 text-xs font-medium text-white">View Document</a>
                  ) : (
                    <span className="mt-3 inline-flex rounded-lg border border-[#d1d5db] bg-[#f3f4f6] px-3 py-1.5 text-xs text-[#6b7280]">No preview available</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
