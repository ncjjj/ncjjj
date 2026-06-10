'use client';

import React, { useEffect, useState } from "react";
import { toast } from "../../../components/common/ToastContainer";
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

function sanitizeFirmName(value?: string | null): string {
  if (typeof value === "string" && value.includes("@")) {
    return "";
  }

  return typeof value === "string" ? value.trim() || "" : "";
}


type FullProfileData = ProfileForm & {
  id?: string;
  address?: string;
  fatherName?: string;
  panCard?: string;
  aadhaarCard?: string;
  dob?: string;
  gender?: string;
  citizen?: string;
  residentialStatus?: string;
  aadhaarOtpVerified?: boolean;
  serviceAccess?: string;
  createdAt?: string;
};

type ProfileApiResponse = {
  user: FullProfileData & {
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

  const [fullProfile, setFullProfile] = useState<FullProfileData>({
    name: "",
    email: "",
    phone: "",
    firmName: "",
  });

  const [hasHydratedProfile, setHasHydratedProfile] = useState(false);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [avatarInputKey, setAvatarInputKey] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const { profileImageUrl, applyAvatarPayload } = useProfileImage({
    userId: session?.user?.id ?? null,
  });

  useEffect(() => {
    if (message) {
      if (message.toLowerCase().includes("successfully")) {
        toast?.success(message);
      } else {
        toast?.error(message);
      }
    }
  }, [message]);

  useEffect(() => {
    if (profileResponse?.user && !hasHydratedProfile) {
      setProfile({
        name: profileResponse.user.name || "",
        email: profileResponse.user.email || "",
        phone: profileResponse.user.mobileNumber || "",
        firmName: sanitizeFirmName(profileResponse.user.firmName),
      });
      setFullProfile({
        ...profileResponse.user,
        firmName: sanitizeFirmName(profileResponse.user.firmName),
      } as FullProfileData);
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
        firmName: sanitizeFirmName(updatedUser?.firmName),
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
      setProfilePicture(null);
      setAvatarInputKey((current) => current + 1);
      setMessage("Profile photo format does not meet requirements.");
      return;
    }

    if (profilePicture.size > MAX_AVATAR_FILE_SIZE_BYTES) {
      setProfilePicture(null);
      setAvatarInputKey((current) => current + 1);
      setMessage("Profile photo size does not meet requirements.");
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
      setAvatarInputKey((current) => current + 1);
      setMessage("Profile photo uploaded successfully.");
      applyAvatarPayload(payload);
      notifyProfileImageUpdated({
        avatarUrl: payload?.avatarUrl || null,
        avatarVersion: payload?.avatarVersion || null,
      });

      if (update) {
        await update({
          avatarPath: payload.avatarPath || null,
          avatarUrl: payload.persistedAvatarUrl ?? payload.avatarUrl ?? null,
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

          {/* Section Title with Manage Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#3b2f1c]">
              Personal Information
            </h3>
            <button
              type="button"
              onClick={() => setEditingSection(editingSection === 'personalInfo' ? null : 'personalInfo')}
              className="px-3 py-1.5 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
            >
              {editingSection === 'personalInfo' ? 'Done Editing' : 'Manage'}
            </button>
          </div>

          {/* Grid */}
          <div className="dashboard-profile-grid grid grid-cols-1 md:grid-cols-2 gap-4">

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
              Passport Size Photo
            </h3>
            <p className="text-xs text-[#6b5b3e]">
              Please upload your passport size photo, which will be seen by admin. JPG/PNG/WebP format only, maximum 5MB.
            </p>
            <input
              key={avatarInputKey}
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

        </div>

        {/* Additional Details Section (Admin Set) */}
        {fullProfile.address || fullProfile.panCard || fullProfile.aadhaarCard ? (
          <div className="dashboard-card-shell dashboard-profile-details bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow border border-[#e8dcc0] space-y-6">
            
            {/* Section Header with Manage Button */}
            <div className="pb-4 border-b border-[#e5d7b6] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#3b2f1c]">
                Additional Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingSection(editingSection === 'additionalDetails' ? null : 'additionalDetails')}
                className="px-3 py-1.5 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
              >
                {editingSection === 'additionalDetails' ? 'Done Editing' : 'Manage'}
              </button>
            </div>

            {/* Address */}
            {fullProfile.address && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#3b2f1c]">Address</label>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'address' ? null : 'address')}
                    className="px-2 py-1 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
                  >
                    {editingSection === 'address' ? 'Done' : 'Manage'}
                  </button>
                </div>
                <div className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] text-[#3b2f1c]">
                  {fullProfile.address}
                </div>
              </div>
            )}

            {fullProfile.fatherName && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#3b2f1c]">Father's Name</label>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'fatherName' ? null : 'fatherName')}
                    className="px-2 py-1 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
                  >
                    {editingSection === 'fatherName' ? 'Done' : 'Manage'}
                  </button>
                </div>
                <div className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] text-[#3b2f1c]">
                  {fullProfile.fatherName}
                </div>
              </div>
            )}

            {/* Grid for document numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PAN Card */}
              {fullProfile.panCard && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#3b2f1c]">PAN Card</label>
                    <button
                      type="button"
                      onClick={() => setEditingSection(editingSection === 'panCard' ? null : 'panCard')}
                      className="px-2 py-0.5 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
                    >
                      {editingSection === 'panCard' ? 'Done' : 'Manage'}
                    </button>
                  </div>
                  <div className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] text-[#3b2f1c] font-mono">
                    {fullProfile.panCard}
                  </div>
                </div>
              )}

              {/* Aadhaar Card */}
              {fullProfile.aadhaarCard && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#3b2f1c]">Aadhaar Card</label>
                    <button
                      type="button"
                      onClick={() => setEditingSection(editingSection === 'aadhaarCard' ? null : 'aadhaarCard')}
                      className="px-2 py-0.5 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
                    >
                      {editingSection === 'aadhaarCard' ? 'Done' : 'Manage'}
                    </button>
                  </div>
                  <div className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] text-[#3b2f1c] font-mono">
                    {fullProfile.aadhaarCard}
                  </div>
                </div>
              )}
            </div>

            {/* Personal Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date of Birth */}
              {fullProfile.dob && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#3b2f1c]">Date of Birth</label>
                    <button
                      type="button"
                      onClick={() => setEditingSection(editingSection === 'dob' ? null : 'dob')}
                      className="px-2 py-0.5 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
                    >
                      {editingSection === 'dob' ? 'Done' : 'Manage'}
                    </button>
                  </div>
                  <div className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] text-[#3b2f1c]">
                    {fullProfile.dob}
                  </div>
                </div>
              )}

              {/* Gender */}
              {fullProfile.gender && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#3b2f1c]">Gender</label>
                    <button
                      type="button"
                      onClick={() => setEditingSection(editingSection === 'gender' ? null : 'gender')}
                      className="px-2 py-0.5 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
                    >
                      {editingSection === 'gender' ? 'Done' : 'Manage'}
                    </button>
                  </div>
                  <div className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] text-[#3b2f1c]">
                    {fullProfile.gender}
                  </div>
                </div>
              )}

              {/* Citizenship */}
              {fullProfile.citizen && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#3b2f1c]">Citizenship</label>
                    <button
                      type="button"
                      onClick={() => setEditingSection(editingSection === 'citizen' ? null : 'citizen')}
                      className="px-2 py-0.5 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
                    >
                      {editingSection === 'citizen' ? 'Done' : 'Manage'}
                    </button>
                  </div>
                  <div className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] text-[#3b2f1c]">
                    {fullProfile.citizen}
                  </div>
                </div>
              )}

              {/* Residential Status */}
              {fullProfile.residentialStatus && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#3b2f1c]">Residential Status</label>
                    <button
                      type="button"
                      onClick={() => setEditingSection(editingSection === 'residentialStatus' ? null : 'residentialStatus')}
                      className="px-2 py-0.5 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
                    >
                      {editingSection === 'residentialStatus' ? 'Done' : 'Manage'}
                    </button>
                  </div>
                  <div className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] text-[#3b2f1c]">
                    {fullProfile.residentialStatus}
                  </div>
                </div>
              )}

              {/* Account Created Date */}
              {fullProfile.createdAt && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#3b2f1c]">Account Created</label>
                    <button
                      type="button"
                      onClick={() => setEditingSection(editingSection === 'createdAt' ? null : 'createdAt')}
                      className="px-2 py-0.5 text-xs rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition"
                    >
                      {editingSection === 'createdAt' ? 'Done' : 'Manage'}
                    </button>
                  </div>
                  <div className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] text-[#3b2f1c]">
                    {new Date(fullProfile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}