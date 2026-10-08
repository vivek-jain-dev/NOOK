import Razorpay from "razorpay";
import prisma from "../../../../lib/prisma";
import { getCustomerSession } from "../../../../lib/customer-auth";

export async function POST(request) {
  try {
    const session = await getCustomerSession(request);
    if (!session) return Response.json({ success: false, error: "Sign in to pay online." }, { status: 401 });

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return Response.json({ success: false, error: "Razorpay is not configured. Choose cash on delivery or enable local demo payments." }, { status: 503 });
    }

    const body = await request.json();
    const paymentMethod = body.paymentMethod === "UPI" ? "UPI" : body.paymentMethod === "CARD" ? "CARD" : null;
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    if (!paymentMethod || !/^[+()\d\s-]{7,20}$/.test(phone) || address.length < 10 || address.length > 500) {
      return Response.json({ success: false, error: "Enter valid delivery details and choose UPI or card." }, { status: 400 });
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

    const products = await prisma.product.findMany({
      where: { id: { in: [...quantities.keys()] }, isActive: true },
      select: { id: true, name: true, sku: true, salePrice: true, stock: true },
    });
    if (products.length !== quantities.size) {
      return Response.json({ success: false, error: "A product in your cart is no longer available." }, { status: 409 });
    }
    for (const product of products) {
      if (product.stock < quantities.get(product.id)) {
        return Response.json({ success: false, error: `${product.name} does not have enough stock.` }, { status: 409 });
      }
    }

    const items = products.map((product) => ({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unitPrice: product.salePrice,
      quantity: quantities.get(product.id),
    }));
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const gateway = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const gatewayOrder = await gateway.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `nook_${Date.now()}`,
    });

    const localOrder = await prisma.customerOrder.create({
      data: {
        accountId: session.id,
        phone,
        address,
        total,
        status: "PENDING_PAYMENT",
        paymentMethod,
        paymentStatus: "PENDING",
        gatewayOrderId: gatewayOrder.id,
        items: { create: items },
      },
      select: { id: true, total: true },
    });

    return Response.json({
      success: true,
      data: { ...localOrder, gatewayOrderId: gatewayOrder.id, amount: gatewayOrder.amount, currency: gatewayOrder.currency, keyId },
    });
  } catch (error) {
    console.error("Unable to initialize online payment:", error);
    return Response.json({ success: false, error: "Unable to start payment. Please try again." }, { status: 500 });
  }
}
