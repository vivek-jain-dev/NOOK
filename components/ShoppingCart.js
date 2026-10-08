"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CART_UPDATED_EVENT, readCart, writeCart } from "../lib/cart";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export default function ShoppingCart() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [paymentMode, setPaymentMode] = useState("cod");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentKeyId, setPaymentKeyId] = useState("");
  const [showCheckout, setShowCheckout] = useState(searchParams.get("checkout") === "1");

  useEffect(() => {
    const update = () => setCart(readCart());
    update();
    fetch("/api/accounts/session")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        setAccount(result.data);
      })
      .catch((sessionError) => console.error("Unable to check customer session:", sessionError))
      .finally(() => setLoading(false));
    fetch("/api/payments/config")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load payment options.");
        setPaymentMode(result.data.mode);
        setPaymentKeyId(result.data.keyId);
      })
      .catch((configError) => setError(configError.message));
    window.addEventListener(CART_UPDATED_EVENT, update);
    return () => window.removeEventListener(CART_UPDATED_EVENT, update);
  }, []);

  function updateQuantity(id, quantity) {
    const updated = cart
      .map((item) => item.id === id ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0);
    setCart(updated);
    writeCart(updated);
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setPlacingOrder(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      if (paymentMethod !== "COD" && paymentMode === "razorpay") {
        await startRazorpayPayment(form);
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.get("phone"),
          address: form.get("address"),
          paymentMethod,
          items: cart.map(({ id, quantity }) => ({ id, quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to place your order.");
      finishOrder(result.data, result.demo);
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setPlacingOrder(false);
    }
  }

  function finishOrder(order, demo = false) {
    setConfirmation({ ...order, demo });
    setCart([]);
    writeCart([]);
  }

  async function startRazorpayPayment(form) {
    if (!paymentKeyId) throw new Error("Razorpay is not configured yet. Choose cash on delivery.");

    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Could not load Razorpay checkout. Check your internet connection."));
        document.body.appendChild(script);
      });
    }

    const response = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: form.get("phone"),
        address: form.get("address"),
        paymentMethod,
        items: cart.map(({ id, quantity }) => ({ id, quantity })),
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to start payment.");

    await new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: result.data.keyId,
        amount: result.data.amount,
        currency: result.data.currency,
        name: "Nook & Co.",
        description: "Your order",
        order_id: result.data.gatewayOrderId,
        prefill: { email: account.email, contact: String(form.get("phone") || "") },
        theme: { color: "#35483a" },
        method: { upi: paymentMethod === "UPI", card: paymentMethod === "CARD" },
        handler: async (payment) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            });
            const verified = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verified.error || "Payment verification failed.");
            finishOrder(verified.data, false);
            resolve();
          } catch (verificationError) {
            setError(verificationError.message);
            reject(verificationError);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. Your bag is unchanged.");
            resolve();
          },
        },
      });
      checkout.on("payment.failed", (failure) => {
        setError(failure.error?.description || "Payment failed. Please try again.");
        reject(new Error("Payment failed."));
      });
      checkout.open();
    });
  }

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);

  if (loading) return <main className="mx-auto min-h-[55vh] max-w-[1320px] px-4 py-14 text-center text-sm text-[#777c74] sm:px-6 lg:px-8">Loading your bag…</main>;

  if (confirmation) {
    return (
      <main className="mx-auto min-h-[55vh] max-w-2xl px-4 py-16 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8978]">Order placed</p>
        <h1 className="mt-3 font-serif text-4xl text-[#293029]">Thank you for your order.</h1>
        <p className="mt-4 text-sm leading-6 text-[#70756d]">
          Order {confirmation.id} is confirmed. {confirmation.demo
            ? `Demo ${confirmation.paymentMethod} payment accepted (no real money was charged).`
            : confirmation.paymentMethod === "COD"
              ? "Payment will be collected on delivery."
              : `${confirmation.paymentMethod} payment completed.`}
        </p>
        <p className="mt-3 text-lg font-medium text-[#35483a]">{formatPrice(confirmation.total)}</p>
        <Link className="mt-7 inline-block rounded-full bg-[#35483a] px-6 py-3 text-sm text-white" href="/products">Continue shopping</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-[1320px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8978]">Nook & Co. / Your bag</p>
      <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em] text-[#293029]">Shopping bag</h1>
      {cart.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-dashed border-[#d9d9d0] bg-white/60 px-6 py-14 text-center">
          <h2 className="font-serif text-2xl text-[#30372f]">Your bag is waiting for something lovely.</h2>
          <Link className="mt-5 inline-block rounded-full bg-[#35483a] px-6 py-3 text-sm text-white" href="/products">Explore the collection</Link>
        </section>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="space-y-3">
            {cart.map((item) => (
              <article className="flex gap-4 rounded-2xl border border-[#e9e8e1] bg-white p-4" key={item.id}>
                <Link className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#efeee8]" href={`/products/${item.id}`}>
                  {item.image && <Image alt={item.name} className="object-cover" fill sizes="96px" src={item.image} />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between sm:flex-row sm:items-center">
                  <div>
                    <Link className="font-medium text-[#30372f] hover:text-[#526b57]" href={`/products/${item.id}`}>{item.name}</Link>
                    <p className="mt-1 text-sm text-[#777c74]">{formatPrice(item.price)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-3 sm:mt-0">
                    <label className="sr-only" htmlFor={`quantity-${item.id}`}>Quantity</label>
                    <input className="w-16 rounded-lg border border-[#e5e4dd] px-2 py-2 text-center text-sm" id={`quantity-${item.id}`} max="20" min="0" onChange={(event) => updateQuantity(item.id, Number(event.target.value))} type="number" value={item.quantity} />
                    <button className="text-xs text-[#874f43] hover:underline" onClick={() => updateQuantity(item.id, 0)} type="button">Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-2xl border border-[#e9e8e1] bg-white p-5">
            <h2 className="font-serif text-xl text-[#293029]">Order summary</h2>
            <div className="mt-4 flex justify-between border-b border-[#eeede7] pb-4 text-sm text-[#6f746e]"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <p className="mt-3 text-xs text-[#85897f]">Choose how you would like to pay.</p>
            {!showCheckout ? (
              <button className="mt-5 w-full rounded-full bg-[#35483a] px-5 py-3.5 text-sm font-medium text-white hover:bg-[#26372b]" onClick={() => setShowCheckout(true)} type="button">Proceed to checkout</button>
            ) : account ? (
              <form className="mt-5 space-y-3" onSubmit={handleCheckout}>
                <p className="mb-3 text-xs text-[#777c74]">Placing order as {account.email}</p>
                <label className="block text-xs font-medium text-[#62675f]">Phone number<input autoComplete="tel" className="mt-1.5 w-full rounded-lg border border-[#e5e4dd] bg-[#fcfbf8] px-3 py-2.5 text-sm outline-none focus:border-[#81927e]" name="phone" required type="tel" /></label>
                <label className="block text-xs font-medium text-[#62675f]">Delivery address<textarea autoComplete="street-address" className="mt-1.5 w-full rounded-lg border border-[#e5e4dd] bg-[#fcfbf8] px-3 py-2.5 text-sm outline-none focus:border-[#81927e]" maxLength={500} minLength={10} name="address" required rows={3} /></label>
                <fieldset className="space-y-2 pt-2">
                  <legend className="mb-2 text-xs font-medium text-[#62675f]">Payment method</legend>
                  {[
                    ["COD", "Cash on delivery", "Pay when your order arrives."],
                    ["UPI", "UPI", paymentMode === "demo" ? "Demo only · no real payment" : "Pay securely with Razorpay"],
                    ["CARD", "Credit or debit card", paymentMode === "demo" ? "Demo only · no real payment" : "Pay securely with Razorpay"],
                  ].map(([value, label, detail]) => {
                    const disabled = value !== "COD" && paymentMode === "cod";
                    return (
                      <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 ${paymentMethod === value ? "border-[#82947f] bg-[#f3f6f1]" : "border-[#e9e8e1]"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`} key={value}>
                        <input checked={paymentMethod === value} className="mt-1 accent-[#526b57]" disabled={disabled} name="paymentMethod" onChange={() => setPaymentMethod(value)} type="radio" value={value} />
                        <span><span className="block text-sm font-medium text-[#30372f]">{label}</span><span className="mt-0.5 block text-[11px] text-[#85897f]">{detail}</span></span>
                      </label>
                    );
                  })}
                  {paymentMode === "demo" && <p className="rounded-lg bg-[#fff8e8] px-3 py-2 text-[11px] leading-5 text-[#795c22]">Demo mode is active: UPI/card selections simulate a successful payment and do not charge money.</p>}
                  {paymentMode === "cod" && <p className="text-[11px] leading-5 text-[#85897f]">UPI and card payments become available after adding Razorpay API keys to .env.local.</p>}
                </fieldset>
                {error && <p className="rounded-lg bg-[#fbf2ef] px-3 py-2 text-xs text-[#874f43]" role="alert">{error}</p>}
                <button className="w-full rounded-full bg-[#35483a] px-5 py-3.5 text-sm font-medium text-white hover:bg-[#26372b] disabled:opacity-60" disabled={placingOrder} type="submit">{placingOrder ? "Processing…" : paymentMode === "demo" && paymentMethod !== "COD" ? `Demo pay ${formatPrice(total)}` : paymentMethod === "COD" ? "Place order · Cash on delivery" : `Pay ${formatPrice(total)} with ${paymentMethod === "UPI" ? "UPI" : "card"}`}</button>
              </form>
            ) : (
              <div className="mt-5">
                <p className="text-sm text-[#6f746e]">Sign in to finish your order.</p>
                <Link className="mt-3 block w-full rounded-full bg-[#35483a] px-5 py-3.5 text-center text-sm font-medium text-white hover:bg-[#26372b]" href="/account?returnTo=%2Fcart%3Fcheckout%3D1">Sign in / create account</Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
