import multer from "multer";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import {
  createSignedSupabaseObjectUrl,
  uploadBufferToSupabase,
} from "../../lib/supabaseStorage";
import type { ApiMessageResponse } from "../../types/domain";

interface UploadedFileSummary {
  type: string;
  filePath: string;
  signedUrl: string | null;
  fileName: string;
  mimeType: string;
}

type UploadApiResponse = ApiMessageResponse | { files: UploadedFileSummary[] };

type MulterRequest = NextApiRequest & {
  files?: Express.Multer.File[];
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Only PDF, JPG, and PNG files are allowed."));
      return;
    }

    cb(null, true);
  },
});

function runMulter(req: MulterRequest, res: NextApiResponse): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const middleware = upload.any() as unknown as (
      request: NextApiRequest,
      response: NextApiResponse,
      callback: (result?: unknown) => void
    ) => void;

    middleware(req, res, (result?: unknown) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }

      resolve(result);
    });
  });
}

function normalizeDocumentType(fieldName: string): string {
  const map: Record<string, string> = {
    panCard: "pan",
    aadhaarCard: "aadhaar",
    photo: "photo",
    signature: "signature",
    additionalDocuments: "additional",
  };

  return map[fieldName] || fieldName;
}

export default async function handler(
  req: MulterRequest,
  res: NextApiResponse<UploadApiResponse>
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    await runMulter(req, res);

    const files: Express.Multer.File[] = Array.isArray(req.files) ? req.files : [];

    if (files.length === 0) {
      res.status(400).json({ message: "At least one document is required." });
      return;
    }

    const uploads: UploadedFileSummary[] = [];

    for (const file of files) {
      const uploaded = await uploadBufferToSupabase({
        fileBuffer: file.buffer,
        fileName: file.originalname,
        fileType: file.mimetype,
        folder: `service-requests/${session.user.id}/${normalizeDocumentType(file.fieldname)}`,
      });

      let signedUrl = null;

      try {
        signedUrl = await createSignedSupabaseObjectUrl({
          path: uploaded.path,
          expiresIn: 3600,
        });
      } catch (error: unknown) {
        console.warn("[api/upload] signed URL fallback failed", error);
      }

      uploads.push({
        type: normalizeDocumentType(file.fieldname),
        filePath: uploaded.path,
        signedUrl,
        fileName: uploaded.fileName,
        mimeType: uploaded.mimeType,
      });
    }

    res.status(200).json({ files: uploads });
  } catch (error: unknown) {
    console.error("[api/upload] failed", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unable to upload files. Ensure file type and size limits are valid.";
    res.status(400).json({
      message,
    });
  }
}
