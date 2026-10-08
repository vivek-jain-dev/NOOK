"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import {
  readWishlist,
  WISHLIST_UPDATED_EVENT,
} from "../lib/wishlist";

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      setLoading(true);
      setError("");
      try {
        const ids = readWishlist();
        const responses = await Promise.all(
          ids.map(async (id) => {
            const response = await fetch(`/api/products/${encodeURIComponent(id)}`);
            if (response.status === 404) return null;
            const result = await response.json();
            if (!response.ok) {
              throw new Error(result.error || "Unable to load wishlist products.");
            }
            return result.data;
          }),
        );
        if (active) setProducts(responses.filter(Boolean));
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWishlist();
    window.addEventListener(WISHLIST_UPDATED_EVENT, loadWishlist);
    window.addEventListener("storage", loadWishlist);
    return () => {
      active = false;
      window.removeEventListener(WISHLIST_UPDATED_EVENT, loadWishlist);
      window.removeEventListener("storage", loadWishlist);
    };
  }, []);

  return (
    <main className="mx-auto min-h-[60vh] max-w-[1320px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8978]">
        Nook & Co. / Your saved finds
      </p>
      <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em] text-[#293029]">
        Your wishlist
      </h1>
      {error && (
        <p className="mt-6 rounded-xl bg-[#fbf2ef] px-5 py-4 text-sm text-[#874f43]" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="py-12 text-sm text-[#777c74]" role="status">Loading your saved finds…</p>
      ) : products.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : !error ? (
        <section className="mt-8 rounded-2xl border border-dashed border-[#d9d9d0] bg-white/60 px-6 py-14 text-center">
          <h2 className="font-serif text-2xl text-[#30372f]">Keep the good ones close.</h2>
          <p className="mt-2 text-sm text-[#777c74]">Tap the heart on any product to save it here.</p>
          <Link className="mt-5 inline-block rounded-full bg-[#35483a] px-6 py-3 text-sm text-white" href="/products">
            Explore the collection
          </Link>
        </section>
      ) : null}
    </main>
  );
}
