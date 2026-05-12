'use client';

import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { notifyProfileImageUpdated } from "../../../lib/profileImage";
import { useProfileImage } from "../../../hooks/useProfileImage";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  firmName: string;
};

type ProfileApiResponse = {
  user: {
    name: string | null;
    email: string | null;
    firmName?: string | null;
    mobileNumber: string;
  };
};

const MAX_AVATAR_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const profileFetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json()) as ProfileApiResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload?.message || "Unable to load profile.");
  }

  return payload;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export default function ProfileSettings() {
  const { data: session, update } = useSession();
  const { data: profileResponse, error: profileFetchError, mutate: mutateProfile } = useSWR(
    session?.user?.id ? "/api/profile" : null,
    profileFetcher,
    {
      revalidateOnFocus: true,
    }
  );

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    firmName: "",
  });
  const [hasHydratedProfile, setHasHydratedProfile] = useState(false);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const { profileImageUrl, applyAvatarPayload } = useProfileImage({
    userId: session?.user?.id ?? null,
  });

  useEffect(() => {
    if (profileResponse?.user && !hasHydratedProfile) {
      setProfile({
        name: profileResponse.user.name || "",
        email: profileResponse.user.email || "",
        phone: profileResponse.user.mobileNumber || "",
        firmName: profileResponse.user.firmName || "",
      });
      setHasHydratedProfile(true);
      return;
    }

    if (hasHydratedProfile) {
      return;
    }

    setProfile({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: session?.user?.mobileNumber || "",
      firmName: "",
    });
  }, [
    hasHydratedProfile,
    profileResponse?.user,
    session?.user?.email,
    session?.user?.mobileNumber,
    session?.user?.name,
  ]);

  useEffect(() => {
    if (!profileFetchError) {
      return;
    }

    setMessage(getErrorMessage(profileFetchError) || "Unable to load profile.");
  }, [profileFetchError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name as keyof ProfileForm;
    setProfile({ ...profile, [key]: e.target.value });
  };

  const handleProfileSave = async () => {
    const normalizedPhone = profile.phone.replace(/\s+/g, "").trim();

    if (normalizedPhone.length < 6) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    setSavingProfile(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          phone: normalizedPhone,
          mobileNumber: normalizedPhone,
        }),
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
        firmName: updatedUser?.firmName || "",
      });

      if (update) {
        await update({
          name: updatedUser?.name,
          email: updatedUser?.email,
          mobileNumber: updatedUser?.mobileNumber,
          firmName: updatedUser?.firmName,
        });
      }

      await mutateProfile();

      setMessage("Profile updated successfully.");
    } catch (error: unknown) {
      setMessage(getErrorMessage(error) || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profilePicture) {
      setMessage("Please choose a profile photo first.");
      return;
    }

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(profilePicture.type)) {
      setMessage("Only JPG, PNG, and WEBP profile photos are allowed.");
      return;
    }

    if (profilePicture.size > MAX_AVATAR_FILE_SIZE_BYTES) {
      setMessage("Profile photo size must be 5MB or less.");
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
      applyAvatarPayload(payload);
      notifyProfileImageUpdated({
        avatarUrl: payload?.avatarUrl || null,
        avatarVersion: payload?.avatarVersion || null,
      });

      if (update) {
        await update({
          avatarPath: payload.avatarPath || null,
          avatarUrl: payload.persistedAvatarUrl || null,
        });
      }
    } catch (error: unknown) {
      setMessage(getErrorMessage(error) || "Unable to upload profile photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!window.confirm("Are you sure you want to delete your profile picture?")) {
      return;
    }

    setDeleting(true);
    setMessage("");

    try {
      const response = await fetch("/api/uploads/avatar", {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to delete profile photo.");
      }

      setMessage("Profile photo deleted successfully.");
      applyAvatarPayload({ avatarUrl: null, avatarPath: null, avatarVersion: null });
      notifyProfileImageUpdated({
        avatarUrl: null,
        avatarVersion: null,
      });

      if (update) {
        await update({
          avatarPath: null,
          avatarUrl: null,
        });
      }
    } catch (error: unknown) {
      setMessage(getErrorMessage(error) || "Unable to delete profile photo.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard-page dashboard-profile min-h-screen flex justify-center p-6">

      <div className="dashboard-page-inner w-full max-w-4xl space-y-5">

        {/* Header */}
        <div className="dashboard-card-shell dashboard-profile-header bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow border border-[#e8dcc0] flex items-center gap-5">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white flex items-center justify-center text-2xl font-bold">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <h2 className="text-xl font-semibold text-[#3b2f1c]">
              {profile.name}
            </h2>
            <p className="text-sm text-[#7a6a4f]">{profile.email}</p>
            {profile.firmName && (
              <p className="text-sm font-medium text-[#3b2f1c]">{profile.firmName}</p>
            )}
          </div>

        </div>

        {/* Main Card */}
        <div className="dashboard-card-shell dashboard-profile-card bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow border border-[#e8dcc0] space-y-6">

          {/* Section Title */}
          <h3 className="text-lg font-semibold text-[#3b2f1c]">
            Personal Information
          </h3>

          {/* Grid */}
          <div className="dashboard-profile-grid grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">

            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="px-4 py-2.5 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="Email"
              className="px-4 py-2.5 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="px-4 py-2.5 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

            <input
              name="firmName"
              value={profile.firmName}
              onChange={handleChange}
              placeholder="Firm Name (Optional)"
              className="px-4 py-2.5 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />

          </div>

            <button
            type="button"
            onClick={handleProfileSave}
            disabled={savingProfile}
            className="w-full py-2.5 rounded-xl bg-[#3b2f1c] text-white font-semibold shadow-md hover:scale-[1.01] transition disabled:opacity-70"
          >
            {savingProfile ? "Saving Profile..." : "Save Profile"}
          </button>

          {/* Profile Upload */}
          <form onSubmit={handleAvatarUpload} className="dashboard-profile-upload space-y-3">
            <h3 className="text-md font-medium text-[#3b2f1c] mb-0">
              Profile Picture
            </h3>
            <p className="text-xs text-[#6b5b3e]">JPG, PNG format only. Maximum 5MB.</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const selectedFile = e.target.files?.[0] ?? null;
                setProfilePicture(selectedFile);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow-md hover:scale-[1.03] transition disabled:opacity-70"
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
              {profileImageUrl && !profileImageUrl.includes("undefined") && (
                <>
                  <button
                    type="button"
                    onClick={() => window.open(profileImageUrl, "_blank")}
                    className="px-4 py-2.5 rounded-xl bg-blue-100 text-blue-700 font-semibold shadow-md hover:scale-[1.03] transition"
                  >
                    View Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteProfilePicture}
                    disabled={deleting}
                    className="px-4 py-2.5 rounded-xl bg-red-100 text-red-700 font-semibold shadow-md hover:scale-[1.03] transition disabled:opacity-70"
                  >
                    {deleting ? "Deleting..." : "Delete Photo"}
                  </button>
                </>
              )}
            </div>
          </form>

          {message ? (
            <p className="text-sm text-[#6b5b3e] bg-[#fffaf0] border border-[#e8dcc0] rounded-xl p-3">
              {message}
            </p>
          ) : null}

          <p className="text-xs text-[#7a6a4f]">
            Profile photo uploads directly to Supabase storage and syncs across the app instantly.
          </p>

        </div>
      </div>
    </div>
  );
}