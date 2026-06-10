import test from "node:test";
import assert from "node:assert/strict";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ENC_PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";
const KEY_SALT = "ncj-field-encryption-v1";

function isPlaceholder(value) {
  if (!value) {
    return true;
  }

  return (
    value.includes("[YOUR-PASSWORD]") ||
    value.includes("[PROJECT-REF]") ||
    value.includes("replace-me") ||
    value.includes("replace-with")
  );
}

function encryptSensitiveField(value, secret) {
  const key = scryptSync(secret, KEY_SALT, 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, authTag, encrypted]).toString("base64url");

  return `${ENC_PREFIX}${payload}`;
}

function decryptSensitiveField(value, secret) {
  if (!value.startsWith(ENC_PREFIX)) {
    return value;
  }

  const key = scryptSync(secret, KEY_SALT, 32);
  const raw = Buffer.from(value.slice(ENC_PREFIX.length), "base64url");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf8");
}

test("placeholder env values are detected", () => {
  assert.equal(isPlaceholder("replace-with-long-random-secret"), true);
  assert.equal(isPlaceholder("postgresql://postgres.[PROJECT-REF]:x@host:6543/postgres"), true);
  assert.equal(isPlaceholder("a-real-production-secret-value"), false);
});

test("sensitive field encryption round-trips", () => {
  const secret = "test-secret-for-encryption";
  const encrypted = encryptSensitiveField("ClientPass123!", secret);

  assert.ok(encrypted.startsWith(ENC_PREFIX));
  assert.equal(decryptSensitiveField(encrypted, secret), "ClientPass123!");
});

test("legacy plaintext values remain readable", () => {
  assert.equal(decryptSensitiveField("legacy-plain-password", "secret"), "legacy-plain-password");
});
