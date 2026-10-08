import { jwtVerify, SignJWT } from "jose";

export const ADMIN_COOKIE_NAME = "nook_admin_session";

function getSigningKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .setIssuer("nook-co")
    .setAudience("nook-admin")
    .sign(getSigningKey());
}

export async function hasAdminSession(request) {
  return hasSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value, "admin");
}

export async function hasSessionToken(token, role) {
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      issuer: "nook-co",
      audience: "nook-admin",
    });
    return payload.role === role;
  } catch (error) {
    if (
      error.code === "ERR_JWS_INVALID" ||
      error.code === "ERR_JWT_INVALID" ||
      error.code === "ERR_JWT_EXPIRED" ||
      error.code === "ERR_JWT_CLAIM_VALIDATION_FAILED" ||
      error.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    ) {
      return false;
    }
    throw error;
  }
}
