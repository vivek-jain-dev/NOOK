import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { CUSTOMER_COOKIE_NAME, getCustomerSession } from "../../../../lib/customer-auth";

export async function GET(request) {
  try {
    const session = await getCustomerSession(request);
    if (!session) {
      return Response.json({ success: false, error: "Please sign in." }, { status: 401 });
    }
    const account = await prisma.customerAccount.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true },
    });
    if (!account) {
      return Response.json({ success: false, error: "Please sign in." }, { status: 401 });
    }
    return Response.json({ success: true, data: account });
  } catch (error) {
    console.error("Unable to verify customer session:", error);
    return Response.json({ success: false, error: "Unable to load your account." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
