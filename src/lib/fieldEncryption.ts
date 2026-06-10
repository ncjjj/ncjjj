import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ENC_PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";
const KEY_SALT = "ncj-field-encryption-v1";

function getEncryptionKey(): Buffer {
  const secret = process.env.FIELD_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;

  if (!secret || secret.includes("replace-with")) {
    throw new Error(
      "FIELD_ENCRYPTION_KEY or NEXTAUTH_SECRET must be configured for sensitive field encryption."
    );
  }

  return scryptSync(secret, KEY_SALT, 32);
}

export function encryptSensitiveField(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, authTag, encrypted]).toString("base64url");

  return `${ENC_PREFIX}${payload}`;
}

export function decryptSensitiveField(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (!value.startsWith(ENC_PREFIX)) {
    return value;
  }

  try {
    const key = getEncryptionKey();
    const raw = Buffer.from(value.slice(ENC_PREFIX.length), "base64url");
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}
