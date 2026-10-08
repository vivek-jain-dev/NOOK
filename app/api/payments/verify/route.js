import { createHmac, timingSafeEqual } from "node:crypto";
import prisma from "../../../../lib/prisma";
import { getCustomerSession } from "../../../../lib/customer-auth";

function signaturesMatch(expected, actual) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual || "");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function POST(request) {
  try {
    const session = await getCustomerSession(request);
    if (!session) return Response.json({ success: false, error: "Sign in to verify payment." }, { status: 401 });

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return Response.json({ success: false, error: "Payment verification is not configured." }, { status: 503 });

    const body = await request.json();
    const { razorpay_order_id: gatewayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
    if ([gatewayOrderId, paymentId, signature].some((value) => typeof value !== "string" || value.length > 200)) {
      return Response.json({ success: false, error: "Payment verification details are invalid." }, { status: 400 });
    }

    const expected = createHmac("sha256", secret).update(`${gatewayOrderId}|${paymentId}`).digest("hex");
    if (!signaturesMatch(expected, signature)) {
      return Response.json({ success: false, error: "Payment could not be verified." }, { status: 400 });
    }

    const order = await prisma.customerOrder.findFirst({
      where: { gatewayOrderId, accountId: session.id },
      include: { items: true },
    });
    if (!order) return Response.json({ success: false, error: "Order not found." }, { status: 404 });
    if (order.paymentStatus === "PAID") {
      return Response.json({ success: true, data: { id: order.id, total: order.total, paymentMethod: order.paymentMethod, paymentStatus: "PAID" } });
    }
    if (order.paymentStatus !== "PENDING") {
      return Response.json({ success: false, error: "This order is not awaiting payment." }, { status: 409 });
    }

    await prisma.$transaction(async (transaction) => {
      const paymentUpdate = await transaction.customerOrder.updateMany({
        where: { id: order.id, accountId: session.id, paymentStatus: "PENDING" },
        data: { paymentStatus: "PAID", status: "PLACED", gatewayPaymentId: paymentId },
      });
      if (paymentUpdate.count !== 1) throw new Error("This payment has already been processed.");

      for (const item of order.items) {
        const stockUpdate = await transaction.product.updateMany({
          where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (stockUpdate.count !== 1) throw new Error(`${item.name} no longer has enough stock. Contact support for a refund.`);
      }
    });

    return Response.json({ success: true, data: { id: order.id, total: order.total, paymentMethod: order.paymentMethod, paymentStatus: "PAID" } });
  } catch (error) {
    console.error("Unable to verify online payment:", error);
    return Response.json({ success: false, error: error.message?.includes("stock") ? error.message : "Unable to verify payment. Please contact support if your bank was charged." }, { status: 500 });
  }
}
