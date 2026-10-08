import prisma from "../../../../lib/prisma";
import { hasAdminSession } from "../../../../lib/admin-auth";

export async function GET(request) {
  try {
    if (!(await hasAdminSession(request))) {
      return Response.json(
        { success: false, error: "Admin access is required." },
        { status: 401 },
      );
    }

    const orders = await prisma.customerOrder.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        phone: true,
        address: true,
        total: true,
        createdAt: true,
        account: { select: { name: true, email: true } },
        items: {
          select: {
            id: true,
            name: true,
            sku: true,
            unitPrice: true,
            quantity: true,
          },
        },
      },
    });

    return Response.json({ success: true, data: orders });
  } catch (error) {
    console.error("Unable to load customer orders:", error);
    return Response.json(
      { success: false, error: "Unable to load orders. Please try again." },
      { status: 500 },
    );
  }
}
