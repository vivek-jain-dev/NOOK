"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import ProductGridSkeleton from "./ProductGridSkeleton";
import StoreIcon from "./StoreIcon";

export default function HomeFeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/products?featured=true&page=1")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load featured products.");
        if (active) setProducts(result.data.products.slice(0, 4));
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <ProductGridSkeleton />;
  if (error) {
    return (
      <p className="rounded-xl border border-[#e2e1da] bg-white/70 px-5 py-4 text-sm text-[#686e65]" role="alert">
        Our collection is unavailable right now. Please try again soon.
      </p>
    );
  }
  if (products.length === 0) {
    return <p className="rounded-xl border border-[#e2e1da] bg-white/70 px-5 py-4 text-sm text-[#686e65]">There are no featured products yet. Add some products to see them here.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <Link className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-[#526b57] sm:hidden" href="/products">
        Shop all favourites <StoreIcon name="arrow" className="h-4 w-4" />
      </Link>
    </>
  );
}
