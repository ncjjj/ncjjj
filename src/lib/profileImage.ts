export const DEFAULT_PROFILE_IMAGE_PATH = "/images/default-avatar.svg";
export const PROFILE_IMAGE_UPDATED_EVENT = "profile-image-updated";

export interface ProfileImageSource {
  avatarUrl?: string | null;
  avatarSignedUrl?: string | null;
  image?: string | null;
}

export interface ProfileImagePayload {
  avatarUrl?: string | null;
  avatarVersion?: number | null;
}

export function appendCacheBuster(url: string, version?: number | null): string {
  if (!version || Number.isNaN(version)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("v", String(version));
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${encodeURIComponent(String(version))}`;
  }
}

export function extractAvatarVersionFromPath(path?: string | null): number | null {
  if (!path) {
    return null;
  }

  const fileName = String(path).split("/").pop() || "";
  const match = fileName.match(/^(\d+)-/);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getProfileImageUrl(
  source?: ProfileImageSource | null,
  fallbackUrl = DEFAULT_PROFILE_IMAGE_PATH,
  version?: number | null
): string {
  const rawUrl =
    source?.avatarSignedUrl ||
    source?.avatarUrl ||
    source?.image ||
    "";

  if (!rawUrl) {
    return fallbackUrl;
  }

  return appendCacheBuster(rawUrl, version);
}

export function notifyProfileImageUpdated(payload: ProfileImagePayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<ProfileImagePayload>(PROFILE_IMAGE_UPDATED_EVENT, {
    detail: payload,
  }));
}
