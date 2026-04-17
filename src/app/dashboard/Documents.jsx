'use client';

import React, { useState } from "react";

const initialDocuments = [
  { id: 1, name: "PAN Card.pdf", status: "Verified" },
  { id: 2, name: "Aadhaar Card.pdf", status: "Pending" },
  { id: 3, name: "Contract.pdf", status: "Verified" },
];

export default function Documents() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [newFile, setNewFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();
    if (newFile) {
      setDocuments([
        ...documents,
        { id: documents.length + 1, name: newFile.name, status: "Pending" },
      ]);
      setNewFile(null);
    }
  };

  const handleDelete = (id) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  return (
    <div className="flex justify-center">

      {/* MAIN CARD */}
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-[#e8dcc0] overflow-hidden">

        {/* TOP STRIP */}
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

        {/* CONTENT */}
        <div className="p-8 space-y-8">

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
          <div className="bg-[#faf6ed] p-6 rounded-2xl border border-[#e8dcc0]">

            <h3 className="text-lg font-semibold text-[#3b2f1c] mb-4">
              Upload Document
            </h3>

            <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-center">

              <input
                type="file"
                onChange={(e) => setNewFile(e.target.files[0])}
                className="flex-1 px-4 py-3 rounded-xl border border-[#e5d7b6] bg-white"
              />

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow hover:scale-[1.03] transition"
              >
                Upload
              </button>

            </form>
          </div>

          {/* DOCUMENT LIST */}
          <div className="bg-white p-6 rounded-2xl border border-[#e8dcc0] shadow-sm">

            <h3 className="text-lg font-semibold text-[#3b2f1c] mb-6">
              Uploaded Documents
            </h3>

            <div className="space-y-4">

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-[#e8dcc0] hover:bg-[#faf6ed] transition"
                >

                  {/* LEFT */}
                  <div className="flex items-center gap-4">

                    {/* ICON */}
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white">
                      📄
                    </div>

                    <div>
                      <p className="font-medium text-[#3b2f1c]">
                        {doc.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === "Verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex gap-3">

                    <button className="px-4 py-2 rounded-xl bg-[#f5e6c8] text-[#6b5b3e] hover:bg-[#e8dcc0] transition">
                      Download
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
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