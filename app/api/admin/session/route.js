import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSession,
} from "../../../../lib/admin-auth";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 60 * 8,
};

export async function POST(request) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return Response.json(
      { success: false, error: "Admin login is not configured on the server." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Please submit a valid login form." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (email !== adminEmail || password !== adminPassword) {
    return Response.json(
      { success: false, error: "Email or password is incorrect." },
      { status: 401 },
    );
  }

  try {
    const token = await createAdminSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE_NAME, token, cookieOptions);
    return response;
  } catch (error) {
    console.error("Unable to create admin session:", error);
    return Response.json(
      { success: false, error: "Admin session is not configured securely." },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
