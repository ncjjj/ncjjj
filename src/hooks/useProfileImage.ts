"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PROFILE_IMAGE_PATH,
  PROFILE_IMAGE_UPDATED_EVENT,
  getProfileImageUrl,
} from "../lib/profileImage";

type AvatarResponse = {
  avatarPath?: string | null;
  avatarUrl?: string | null;
  avatarVersion?: number | null;
};

type UseProfileImageInput = {
  userId?: string | null;
  refreshIntervalMs?: number;
};

const DEFAULT_REFRESH_INTERVAL_MS = 50 * 60 * 1000;

export function useProfileImage({
  userId,
  refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS,
}: UseProfileImageInput) {
  const [profileImageUrl, setProfileImageUrl] = useState<string>(DEFAULT_PROFILE_IMAGE_PATH);

  const applyAvatarPayload = useCallback((payload?: AvatarResponse | null) => {
    setProfileImageUrl(
      getProfileImageUrl(
        {
          avatarUrl: payload?.avatarUrl || null,
        },
        DEFAULT_PROFILE_IMAGE_PATH,
        payload?.avatarVersion || null
      )
    );
  }, []);

  const loadProfileImage = useCallback(async () => {
    if (!userId) {
      setProfileImageUrl(DEFAULT_PROFILE_IMAGE_PATH);
      return;
    }

    try {
      const response = await fetch("/api/uploads/avatar", {
        cache: "no-store",
      });
      const payload = (await response.json()) as AvatarResponse;

      if (!response.ok) {
        throw new Error("Unable to load profile image.");
      }

      applyAvatarPayload(payload);
    } catch {
      setProfileImageUrl(DEFAULT_PROFILE_IMAGE_PATH);
    }
  }, [applyAvatarPayload, userId]);

  useEffect(() => {
    loadProfileImage();

    if (!userId) {
      return;
    }

    const interval = window.setInterval(loadProfileImage, refreshIntervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadProfileImage, refreshIntervalMs, userId]);

  useEffect(() => {
    const handleProfileImageUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<AvatarResponse>;
      applyAvatarPayload(customEvent.detail);
    };

    window.addEventListener(PROFILE_IMAGE_UPDATED_EVENT, handleProfileImageUpdated as EventListener);

    return () => {
      window.removeEventListener(PROFILE_IMAGE_UPDATED_EVENT, handleProfileImageUpdated as EventListener);
    };
  }, [applyAvatarPayload]);

  return {
    profileImageUrl,
    loadProfileImage,
    applyAvatarPayload,
  };
}
