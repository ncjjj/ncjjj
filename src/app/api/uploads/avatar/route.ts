import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { findUserById, updateUserAvatarPath } from "../../../../db/queries/users";
import {
  getSupabaseBucketVisibility,
  getSupabasePublicObjectUrl,
  resolveSupabaseObjectUrl,
  uploadFileToSupabase,
} from "../../../../lib/supabaseStorage";
import { extractAvatarVersionFromPath } from "../../../../lib/profileImage";

const SIGNED_URL_TTL_SECONDS = 3600;
const MAX_AVATAR_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await findUserById(session.user.id);
    const avatarPath = user?.avatarPath || null;
    const persistedAvatarUrl = user?.avatarUrl || null;
    const avatarVersion = extractAvatarVersionFromPath(avatarPath);

    if (!avatarPath && !persistedAvatarUrl) {
      return NextResponse.json({
        avatarPath: null,
        avatarUrl: null,
        avatarVersion: null,
        bucketVisibility: getSupabaseBucketVisibility(),
      });
    }

    let avatarUrl = persistedAvatarUrl;
    const bucketVisibility = getSupabaseBucketVisibility();

    if (avatarPath) {
      const resolved = await resolveSupabaseObjectUrl({
        path: avatarPath,
        expiresIn: SIGNED_URL_TTL_SECONDS,
        version: avatarVersion,
      });
      avatarUrl = resolved.avatarUrl;
    }

    return NextResponse.json({
      avatarPath,
      avatarUrl,
      avatarVersion,
      bucketVisibility,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });
  } catch (error) {
    console.error("[uploads/avatar] GET failed", error);
    return NextResponse.json(
      {
        avatarPath: null,
        avatarUrl: null,
        avatarVersion: null,
        bucketVisibility: "unknown",
        message: "Unable to load avatar.",
      },
      { status: 200 }
    );
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof Blob)) {
      return NextResponse.json({ message: "Profile photo is required." }, { status: 400 });
    }

    const fileName = "name" in fileEntry && typeof fileEntry.name === "string"
      ? fileEntry.name
      : "avatar-upload";
    const fileType = typeof fileEntry.type === "string" ? fileEntry.type : "";
    const fileSize = typeof fileEntry.size === "number" ? fileEntry.size : 0;

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(fileType)) {
      return NextResponse.json(
        { message: "Only JPG, PNG, and WEBP profile photos are allowed." },
        { status: 400 }
      );
    }

    if (fileSize > MAX_AVATAR_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "Profile photo size must be 5MB or less." },
        { status: 400 }
      );
    }

    const file = new File([fileEntry], fileName, {
      type: fileType || "application/octet-stream",
    });

    const uploaded = await uploadFileToSupabase({
      file,
      folder: `avatars/${session.user.id}`,
    });

    const avatarVersion = extractAvatarVersionFromPath(uploaded.path) ?? Date.now();
    const bucketVisibility = getSupabaseBucketVisibility();
    const persistedAvatarUrl =
      bucketVisibility === "public"
        ? getSupabasePublicObjectUrl(uploaded.path)
        : null;

    await updateUserAvatarPath(session.user.id, uploaded.path, persistedAvatarUrl);

    const resolved = await resolveSupabaseObjectUrl({
      path: uploaded.path,
      expiresIn: SIGNED_URL_TTL_SECONDS,
      version: avatarVersion,
    });

    return NextResponse.json({
      avatarPath: uploaded.path,
      avatarUrl: resolved.avatarUrl,
      avatarVersion,
      bucketVisibility,
      persistedAvatarUrl,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });
  } catch (error: unknown) {
    console.error("[uploads/avatar] failed", error);

    return NextResponse.json(
      { message: getErrorMessage(error) || "Unable to upload profile photo." },
      { status: 500 }
    );
  }
}
