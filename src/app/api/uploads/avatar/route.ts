import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { findUserById, updateUserAvatarPath } from "../../../../db/queries/users";
import {
  findProfileByEmail,
  updateProfileAvatarByEmail,
} from "../../../../db/queries/profiles";
import {
  deleteAppwriteObjects,
  getAppwriteBucketVisibility,
  getAppwritePublicObjectUrl,
  inferImageMimeType,
  resolveAppwriteObjectUrl,
  uploadFileToAppwrite,
} from "../../../../lib/appwriteStorage";
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
    const profile = user ? await findProfileByEmail(user.email) : null;
    const avatarPath = profile?.avatarPath || user?.avatarPath || null;
    const persistedAvatarUrl = profile?.avatarUrl || user?.avatarUrl || null;
    const avatarVersion = extractAvatarVersionFromPath(avatarPath);

    if (!avatarPath && !persistedAvatarUrl) {
      return NextResponse.json({
        avatarPath: null,
        avatarUrl: null,
        avatarVersion: null,
        bucketVisibility: getAppwriteBucketVisibility(),
      });
    }

    let avatarUrl = persistedAvatarUrl;
    const bucketVisibility = getAppwriteBucketVisibility();

    if (avatarPath) {
      const resolved = await resolveAppwriteObjectUrl({
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

  let uploadedPath: string | null = null;

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
    const resolvedMimeType = inferImageMimeType(fileName, fileType);

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(resolvedMimeType)) {
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
      type: resolvedMimeType,
    });

    const existingUser = await findUserById(session.user.id);
    const previousAvatarPath = existingUser?.avatarPath || null;
    const existingProfile = existingUser ? await findProfileByEmail(existingUser.email) : null;
    const previousProfileAvatarPath = existingProfile?.avatarPath || null;

    const uploaded = await uploadFileToAppwrite({
      file,
      folder: `avatars/${session.user.id}`,
    });
    uploadedPath = uploaded.path;

    const avatarVersion = extractAvatarVersionFromPath(uploaded.path) ?? Date.now();
    const bucketVisibility = getAppwriteBucketVisibility();
    const persistedAvatarUrl =
      bucketVisibility === "public" && uploaded.publicUrl
        ? uploaded.publicUrl
        : null;

    await updateUserAvatarPath(session.user.id, uploaded.path, persistedAvatarUrl);
    if (existingUser) {
      await updateProfileAvatarByEmail(existingUser.email, uploaded.path, persistedAvatarUrl);
    }

    if (previousAvatarPath && previousAvatarPath !== uploaded.path) {
      try {
        await deleteAppwriteObjects([previousAvatarPath]);
      } catch (cleanupError) {
        console.warn("[uploads/avatar] failed to remove previous avatar object", cleanupError);
      }
    }

    if (previousProfileAvatarPath && previousProfileAvatarPath !== uploaded.path) {
      try {
        await deleteAppwriteObjects([previousProfileAvatarPath]);
      } catch (cleanupError) {
        console.warn("[uploads/avatar] failed to remove previous profile avatar object", cleanupError);
      }
    }

    const resolved = await resolveAppwriteObjectUrl({
      path: uploaded.path,
      expiresIn: SIGNED_URL_TTL_SECONDS,
      version: avatarVersion,
    });

    uploadedPath = null;

    return NextResponse.json({
      avatarPath: uploaded.path,
      avatarUrl: resolved.avatarUrl,
      avatarVersion,
      bucketVisibility,
      persistedAvatarUrl,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });
  } catch (error: unknown) {
    if (uploadedPath) {
      try {
        await deleteAppwriteObjects([uploadedPath]);
      } catch (rollbackError) {
        console.warn("[uploads/avatar] failed to roll back uploaded object", rollbackError);
      }
    }

    console.error("[uploads/avatar] failed", error);

    return NextResponse.json(
      {
        message:
          getErrorMessage(error) ||
          "Unable to upload profile photo. The file must be saved to storage before your profile is updated.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingUser = await findUserById(session.user.id);
    const previousAvatarPath = existingUser?.avatarPath || null;
    const existingProfile = existingUser ? await findProfileByEmail(existingUser.email) : null;
    const previousProfileAvatarPath = existingProfile?.avatarPath || null;

    if (previousAvatarPath) {
      await deleteAppwriteObjects([previousAvatarPath]);
    }

    if (previousProfileAvatarPath) {
      await deleteAppwriteObjects([previousProfileAvatarPath]);
    }

    await updateUserAvatarPath(session.user.id, null, null);
    if (existingUser) {
      await updateProfileAvatarByEmail(existingUser.email, null, null);
    }

    return NextResponse.json({
      message: "Profile photo deleted successfully.",
      avatarPath: null,
      avatarUrl: null,
    });
  } catch (error: unknown) {
    console.error("[uploads/avatar] DELETE failed", error);

    return NextResponse.json(
      { message: getErrorMessage(error) || "Unable to delete profile photo." },
      { status: 500 }
    );
  }
}
