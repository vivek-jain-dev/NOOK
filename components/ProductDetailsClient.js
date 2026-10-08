"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductPurchaseActions from "./ProductPurchaseActions";
import ProductGridSkeleton from "./ProductGridSkeleton";
import StoreIcon from "./StoreIcon";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/products/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 404) {
          if (active) setMissing(true);
          return;
        }
        if (!response.ok) throw new Error(result.error || "Unable to load this product.");
        if (active) setProduct(result.data);
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
  }, [id]);

  if (loading) {
    return (
      <main aria-label="Loading product" className="mx-auto min-h-[60vh] max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8" role="status">
        <ProductGridSkeleton count={2} />
        <span className="sr-only">Loading product…</span>
      </main>
    );
  }

  if (missing) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-[720px] flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7b8978]">Not on our shelves</p>
        <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#293029]">We couldn&apos;t find that product.</h1>
        <Link className="mt-7 rounded-full bg-[#35483a] px-5 py-3 text-sm font-medium text-white hover:bg-[#26372b]" href="/products">Browse the collection</Link>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto min-h-[55vh] max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
        <p className="rounded-xl border border-[#ead7d2] bg-[#fbf2ef] px-5 py-4 text-sm text-[#874f43]" role="alert">
          {error || "Unable to load this product. Please try again."}
        </p>
      </main>
    );
  }

  const discount = product.price > 0
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <main className="mx-auto min-h-[60vh] max-w-[1320px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-7 text-xs text-[#85897f]">
        <Link className="hover:text-[#526b57]" href="/">Home</Link>
        <span className="mx-2">/</span>
        <Link className="hover:text-[#526b57]" href="/products">Shop all</Link>
        <span className="mx-2">/</span>
        <span className="text-[#4e554c]">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="grid grid-cols-2 gap-3">
          {product.images.map((image, index) => (
            <div className={`relative overflow-hidden rounded-2xl bg-[#efeee8] ${index === 0 ? "col-span-2 aspect-[1/0.85]" : "aspect-square"}`} key={`${image}-${index}`}>
              <Image alt={`${product.name}, image ${index + 1}`} className="object-cover" fill priority={index === 0} sizes="(max-width: 1024px) 100vw, 50vw" src={image} />
            </div>
          ))}
        </div>

        <section className="lg:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b8978]">{product.category}{product.brand ? ` · ${product.brand}` : ""}</p>
          <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.045em] text-[#293029] sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-[#6f746e]">
            <StoreIcon name="star" className="h-4 w-4 fill-[#bd8b4c] text-[#bd8b4c]" />
            <span>{Number(product.rating).toFixed(1)}</span><span>·</span><span>{product.reviewCount} reviews</span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold text-[#29352d]">{formatPrice(product.salePrice)}</span>
            {product.salePrice < product.price && <>
              <span className="text-base text-[#92958e] line-through">{formatPrice(product.price)}</span>
              <span className="text-xs font-medium text-[#526b57]">Save {discount}%</span>
            </>}
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[#70756d]">{product.description}</p>
          <div className={`mt-6 flex items-center gap-2 text-sm ${product.stock > 0 ? "text-[#526b57]" : "text-[#9a5549]"}`}>
            <span className={`h-2 w-2 rounded-full ${product.stock > 0 ? "bg-[#64816a]" : "bg-[#b76355]"}`} />
            {product.stock > 0 ? "In stock and ready to ship" : "Out of stock"}
          </div>
          <ProductPurchaseActions product={{ id: product.id, name: product.name, salePrice: product.salePrice, image: product.images[0], stock: product.stock }} />

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-[#e9e8e1] pt-6 text-xs">
            <div><dt className="text-[#85897f]">Category</dt><dd className="mt-1 font-medium text-[#434a41]">{product.category}</dd></div>
            <div><dt className="text-[#85897f]">SKU</dt><dd className="mt-1 font-medium text-[#434a41]">{product.sku}</dd></div>
          </dl>
        </section>
      </div>
    </main>
  );
}
