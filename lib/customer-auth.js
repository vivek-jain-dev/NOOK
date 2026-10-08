import { jwtVerify, SignJWT } from "jose";

export const CUSTOMER_COOKIE_NAME = "nook_customer_session";

function signingKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createCustomerSession(account) {
  return new SignJWT({ role: "customer", email: account.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(account.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .setIssuer("nook-co")
    .setAudience("nook-customer")
    .sign(signingKey());
}

export async function getCustomerSession(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, signingKey(), {
      issuer: "nook-co",
      audience: "nook-customer",
    });
    if (payload.role !== "customer" || !payload.sub || typeof payload.email !== "string") {
      return null;
    }
    return { id: payload.sub, email: payload.email };
  } catch (error) {
    if (
      error.code === "ERR_JWS_INVALID" ||
      error.code === "ERR_JWT_INVALID" ||
      error.code === "ERR_JWT_EXPIRED" ||
      error.code === "ERR_JWT_CLAIM_VALIDATION_FAILED" ||
      error.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    ) {
      return null;
    }
    throw error;
  }
}
