import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { findUserById, updateUserAvatarPath } from "../../../../db/queries/users";
import {
  createSignedSupabaseObjectUrl,
  uploadFileToSupabase,
} from "../../../../lib/supabaseStorage";

const SIGNED_URL_TTL_SECONDS = 3600;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await findUserById(session.user.id);
    const avatarPath = user?.avatarPath || null;

    if (!avatarPath) {
      return NextResponse.json({ avatarPath: null, avatarSignedUrl: null });
    }

    const avatarSignedUrl = await createSignedSupabaseObjectUrl({
      path: avatarPath,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });

    return NextResponse.json({
      avatarPath,
      avatarSignedUrl,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });
  } catch (error) {
    console.error("[uploads/avatar] GET failed", error);
    return NextResponse.json(
      { avatarPath: null, avatarSignedUrl: null, message: "Unable to load avatar." },
      { status: 200 }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ message: "Profile photo is required." }, { status: 400 });
    }

    const uploaded = await uploadFileToSupabase({
      file,
      folder: `avatars/${session.user.id}`,
    });

    await updateUserAvatarPath(session.user.id, uploaded.path);

    let avatarSignedUrl = null;

    try {
      avatarSignedUrl = await createSignedSupabaseObjectUrl({
        path: uploaded.path,
        expiresIn: SIGNED_URL_TTL_SECONDS,
      });
    } catch (error) {
      console.warn("[uploads/avatar] signed URL generation failed", error);
    }

    return NextResponse.json({
      avatarPath: uploaded.path,
      avatarSignedUrl,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });
  } catch (error) {
    console.error("[uploads/avatar] failed", error);

    return NextResponse.json(
      { message: error?.message || "Unable to upload profile photo." },
      { status: 500 }
    );
  }
}
