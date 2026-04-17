'use client';

import React, { use, useState } from "react";

export default function ProfileSettings() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    address: "123 Main St, Springfield",
    dob: "1990-01-01",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [kycDocuments, setKycDocuments] = useState([]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex justify-center p-6">

      <div className="w-full max-w-4xl space-y-8">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow border border-[#e8dcc0] flex items-center gap-6">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white flex items-center justify-center text-2xl font-bold">
            {profile.name.charAt(0)}
          </div>

          {/* Info */}
          <div>
            <h2 className="text-xl font-semibold text-[#3b2f1c]">
              {profile.name}
            </h2>
            <p className="text-sm text-[#7a6a4f]">{profile.email}</p>
          </div>

        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow border border-[#e8dcc0] space-y-8">

          {/* Section Title */}
          <h3 className="text-lg font-semibold text-[#3b2f1c]">
            Personal Information
          </h3>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="Email"
              className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

            <input
              type="date"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

          </div>

          {/* Address */}
          <textarea
            name="address"
            value={profile.address}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
          />

          {/* Profile Upload */}
          <div>
            <h3 className="text-md font-medium text-[#3b2f1c] mb-2">
              Profile Picture
            </h3>
            <input
              type="file"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />
          </div>

          {/* KYC Section */}
          <div>
            <h3 className="text-lg font-semibold text-[#3b2f1c] mb-3">
              KYC Documents
            </h3>

            <input
              type="file"
              multiple
              onChange={(e) =>
                setKycDocuments([...kycDocuments, ...Array.from(e.target.files)])
              }
              className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

            {/* Uploaded Files */}
            {kycDocuments.length > 0 && (
              <div className="mt-3 space-y-2 text-sm text-[#6b5b3e]">
                {kycDocuments.map((file, i) => (
                  <p key={i}>📄 {file.name}</p>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow-md hover:scale-[1.03] transition">
            Save Changes
          </button>

        </div>
      </div>
    </div>
  );
}