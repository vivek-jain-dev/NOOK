export async function GET(request) {
  const hostname = new URL(request.url).hostname;
  const localRequest = hostname === "localhost" || hostname === "127.0.0.1";
  const demo = localRequest &&
    process.env.NODE_ENV !== "production" &&
    process.env.PAYMENT_DEMO_MODE === "true";
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const razorpay = Boolean(keyId && keySecret);

  return Response.json({
    success: true,
    data: {
      mode: demo ? "demo" : razorpay ? "razorpay" : "cod",
      keyId: razorpay ? keyId : "",
    },
  });
}
