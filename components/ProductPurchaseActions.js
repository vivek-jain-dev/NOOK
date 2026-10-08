"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "../lib/cart";

export default function ProductPurchaseActions({ product }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const unavailable = product.stock < 1;

  function add(continueToCart) {
    if (unavailable) return;
    addToCart(product);
    setMessage("Added to your shopping bag.");
    if (continueToCart) router.push("/cart?checkout=1");
  }

  return (
    <div className="mt-7">
      <div className="flex flex-wrap gap-3">
        <button className="rounded-full border border-[#526b57] px-6 py-3 text-sm font-medium text-[#35483a] transition-colors hover:bg-[#eef1eb] disabled:cursor-not-allowed disabled:opacity-50" disabled={unavailable} onClick={() => add(false)} type="button">
          Add to bag
        </button>
        <button className="rounded-full bg-[#35483a] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#26372b] disabled:cursor-not-allowed disabled:opacity-50" disabled={unavailable} onClick={() => add(true)} type="button">
          Buy now
        </button>
      </div>
      {message && <p className="mt-3 text-xs text-[#526b57]" role="status">{message}</p>}
    </div>
  );
}
