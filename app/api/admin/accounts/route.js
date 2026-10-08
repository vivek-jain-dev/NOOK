import { connection } from "next/server";
import prisma from "../../../../lib/prisma";
import { hasAdminSession } from "../../../../lib/admin-auth";

export async function GET(request) {
  await connection();
  if (!(await hasAdminSession(request))) {
    return Response.json(
      { success: false, error: "Admin access is required." },
      { status: 401 },
    );
  }

  try {
    const accounts = await prisma.customerAccount.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return Response.json({ success: true, data: accounts });
  } catch (error) {
    console.error("Unable to load customer accounts:", error);
    return Response.json(
      { success: false, error: "Unable to load accounts. Please try again." },
      { status: 500 },
    );
  }
}
