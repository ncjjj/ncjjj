'use client';

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfileSettings() {
  const { data: session, update } = useSession();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadSignedAvatar = async () => {
    try {
      const response = await fetch("/api/uploads/avatar", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to load profile photo.");
      }

      setAvatarSignedUrl(payload?.avatarSignedUrl || "");
    } catch (error) {
      setAvatarSignedUrl("");
    }
  };

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: session?.user?.name || prev.name,
      email: session?.user?.email || prev.email,
      phone: session?.user?.mobileNumber || prev.phone,
    }));

    loadSignedAvatar();

    const refreshTimer = setInterval(() => {
      loadSignedAvatar();
    }, 50 * 60 * 1000);

    return () => {
      clearInterval(refreshTimer);
    };
  }, [session]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update profile.");
      }

      const updatedUser = payload.user;

      setProfile({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        phone: updatedUser?.mobileNumber || "",
      });

      if (update) {
        await update({
          name: updatedUser?.name,
          email: updatedUser?.email,
          mobileNumber: updatedUser?.mobileNumber,
        });
      }

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    event.preventDefault();

    if (!profilePicture) {
      setMessage("Please choose a profile photo first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", profilePicture);

      const response = await fetch("/api/uploads/avatar", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to upload profile photo.");
      }

      setProfilePicture(null);
      setMessage("Profile photo uploaded successfully.");
      setAvatarSignedUrl(payload?.avatarSignedUrl || "");

      if (update) {
        await update({ avatarPath: payload.avatarPath || null });
      }
    } catch (error) {
      setMessage(error.message || "Unable to upload profile photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-6">

      <div className="w-full max-w-4xl space-y-8">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow border border-[#e8dcc0] flex items-center gap-6">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white flex items-center justify-center text-2xl font-bold">
            {avatarSignedUrl ? (
              <img
                src={avatarSignedUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{profile.name.charAt(0) || "U"}</span>
            )}
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
              placeholder="Phone Number"
              className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

          </div>

          <button
            type="button"
            onClick={handleProfileSave}
            disabled={savingProfile}
            className="w-full py-3 rounded-xl bg-[#3b2f1c] text-white font-semibold shadow-md hover:scale-[1.01] transition disabled:opacity-70"
          >
            {savingProfile ? "Saving Profile..." : "Save Profile"}
          </button>

          {/* Profile Upload */}
          <form onSubmit={handleAvatarUpload} className="space-y-4">
            <h3 className="text-md font-medium text-[#3b2f1c] mb-2">
              Profile Picture
            </h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow-md hover:scale-[1.03] transition disabled:opacity-70"
            >
              {uploading ? "Uploading..." : "Upload to Supabase Bucket"}
            </button>
          </form>

          {message ? (
            <p className="text-sm text-[#6b5b3e] bg-[#fffaf0] border border-[#e8dcc0] rounded-xl p-3">
              {message}
            </p>
          ) : null}

          <p className="text-xs text-[#7a6a4f]">
            Profile photo uploads directly to Supabase storage and appears in the navbar after refresh.
          </p>

        </div>
      </div>
    </div>
  );
}