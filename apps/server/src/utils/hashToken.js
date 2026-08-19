import crypto from "crypto";

// Refresh tokens are already high-entropy random JWTs, so a fast digest is
// enough here - no need for bcrypt's slow hashing (that's reserved for
// low-entropy user passwords).
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
