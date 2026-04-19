import multer from "multer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import {
  createSignedSupabaseObjectUrl,
  uploadBufferToSupabase,
} from "../../lib/supabaseStorage";

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
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Only PDF, JPG, and PNG files are allowed."));
      return;
    }

    cb(null, true);
  },
});

function runMulter(req, res) {
  return new Promise((resolve, reject) => {
    upload.any()(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }

      resolve(result);
    });
  });
}

function normalizeDocumentType(fieldName) {
  const map = {
    panCard: "pan",
    aadhaarCard: "aadhaar",
    photo: "photo",
    signature: "signature",
    additionalDocuments: "additional",
  };

  return map[fieldName] || fieldName;
}

export default async function handler(req, res) {
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

    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length === 0) {
      res.status(400).json({ message: "At least one document is required." });
      return;
    }

    const uploads = [];

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
      } catch (error) {
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
  } catch (error) {
    console.error("[api/upload] failed", error);
    res.status(400).json({
      message:
        error?.message ||
        "Unable to upload files. Ensure file type and size limits are valid.",
    });
  }
}
