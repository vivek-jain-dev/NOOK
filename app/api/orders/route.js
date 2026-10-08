import prisma from "../../../lib/prisma";
import { getCustomerSession } from "../../../lib/customer-auth";

function demoPaymentsEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.PAYMENT_DEMO_MODE === "true";
}

export async function POST(request) {
  try {
    const session = await getCustomerSession(request);
    if (!session) {
      return Response.json({ success: false, error: "Sign in to place an order." }, { status: 401 });
    }

    const body = await request.json();
    const paymentMethod = body.paymentMethod === "UPI" || body.paymentMethod === "CARD"
      ? body.paymentMethod
      : "COD";
    if (paymentMethod !== "COD" && !demoPaymentsEnabled()) {
      return Response.json(
        { success: false, error: "Online payment is not configured. Choose cash on delivery." },
        { status: 503 },
      );
    }
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    if (!/^[+()\d\s-]{7,20}$/.test(phone) || address.length < 10 || address.length > 500) {
      return Response.json({ success: false, error: "Enter a valid phone number and delivery address." }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
      return Response.json({ success: false, error: "Your cart is empty or invalid." }, { status: 400 });
    }

    const quantities = new Map();
    for (const item of body.items) {
      if (!item || typeof item.id !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        return Response.json({ success: false, error: "Your cart contains an invalid item." }, { status: 400 });
      }
      quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
      if (quantities.get(item.id) > 20) {
        return Response.json({ success: false, error: "Maximum quantity per product is 20." }, { status: 400 });
      }
    }

    const order = await prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: { id: { in: [...quantities.keys()] }, isActive: true },
        select: { id: true, name: true, sku: true, salePrice: true },
      });
      if (products.length !== quantities.size) throw new Error("A product in your cart is no longer available.");

      for (const product of products) {
        const quantity = quantities.get(product.id);
        const result = await transaction.product.updateMany({
          where: { id: product.id, isActive: true, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (result.count !== 1) throw new Error(`${product.name} does not have enough stock.`);
      }

      const items = products.map((product) => ({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.salePrice,
        quantity: quantities.get(product.id),
      }));
      const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      return transaction.customerOrder.create({
        data: {
          accountId: session.id,
          phone,
          address,
          total,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "COD_PENDING" : "DEMO_PAID",
          items: { create: items },
        },
        select: { id: true, total: true, createdAt: true, paymentMethod: true, paymentStatus: true },
      });
    });

    return Response.json({
      success: true,
      data: order,
      demo: paymentMethod !== "COD",
    }, { status: 201 });
  } catch (error) {
    if (error.message?.includes("cart") || error.message?.includes("stock") || error.message?.includes("available")) {
      return Response.json({ success: false, error: error.message }, { status: 409 });
    }
    console.error("Unable to place customer order:", error);
    return Response.json({ success: false, error: "Unable to place your order. Please try again." }, { status: 500 });
  }
}
