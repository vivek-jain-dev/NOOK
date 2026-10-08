import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { createCustomerSession, CUSTOMER_COOKIE_NAME } from "../../../lib/customer-auth";

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
    return Response.json(
      { success: false, error: "Please submit a valid form." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2 || name.length > 80) {
    return Response.json(
      { success: false, error: "Name must be between 2 and 80 characters." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json(
      { success: false, error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (password.length < 10 || password.length > 128) {
    return Response.json(
      { success: false, error: "Password must be between 10 and 128 characters." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const account = await prisma.customerAccount.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = await createCustomerSession(account);
    const response = NextResponse.json({ success: true, data: account }, { status: 201 });
    response.cookies.set(CUSTOMER_COOKIE_NAME, token, cookieOptions);
    return response;
  } catch (error) {
    if (error.code === "P2002") {
      return Response.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    console.error("Unable to create customer account:", error);
    return Response.json(
      { success: false, error: "Unable to create your account. Please try again." },
      { status: 500 },
    );
  }
}
