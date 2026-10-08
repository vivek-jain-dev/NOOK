import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { createCustomerSession, CUSTOMER_COOKIE_NAME } from "../../../../lib/customer-auth";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Please submit a valid form." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return Response.json({ success: false, error: "Enter your email and password." }, { status: 400 });
  }

  try {
    const account = await prisma.customerAccount.findUnique({ where: { email } });
    const valid = account && await bcrypt.compare(password, account.passwordHash);
    if (!valid) {
      return Response.json({ success: false, error: "Email or password is incorrect." }, { status: 401 });
    }
    const safeAccount = { id: account.id, name: account.name, email: account.email };
    const token = await createCustomerSession(safeAccount);
    const response = NextResponse.json({ success: true, data: safeAccount });
    response.cookies.set(CUSTOMER_COOKIE_NAME, token, cookieOptions);
    return response;
  } catch (error) {
    console.error("Unable to sign in customer:", error);
    return Response.json({ success: false, error: "Unable to sign in. Please try again." }, { status: 500 });
  }
}
