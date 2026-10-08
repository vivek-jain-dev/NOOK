"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "../../components/ProductCard";
import ProductGridSkeleton from "../../components/ProductGridSkeleton";

function getPageHref(search, page) {
  const params = new URLSearchParams(search);
  params.set("page", String(page));
  return `/products?${params.toString()}`;
}

function ProductListing() {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const query = search ? `?${search}` : "";

    fetch(`/api/products${query}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load products.");
        if (active) {
          setCatalog(result.data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search]);

  const params = new URLSearchParams(search);
  const hasFilters = ["q", "category", "brand", "minPrice", "maxPrice", "minRating"]
    .some((name) => Boolean(params.get(name)));

  return (
    <main className="mx-auto min-h-[60vh] max-w-[1320px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7b8978]">Find something lovely</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-0.045em] text-[#293029] sm:text-5xl">Shop all</h1>
      </div>

      {catalog && <ProductFilterForm filters={Object.fromEntries(params)} catalog={catalog} />}
      {error && <p className="mb-6 rounded-xl border border-[#ead7d2] bg-[#fbf2ef] px-5 py-4 text-sm text-[#874f43]" role="alert">{error}</p>}
      {loading && !catalog ? <ProductGridSkeleton /> : catalog ? (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#777c74]">
            <p>{catalog.totalCount} {catalog.totalCount === 1 ? "product" : "products"}{params.get("q") ? ` for “${params.get("q")}”` : ""}</p>
            {hasFilters && <Link className="text-[#526b57] hover:underline" href="/products">Clear filters</Link>}
          </div>
          {catalog.products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d9d9d0] bg-white/60 px-6 py-14 text-center">
              <h2 className="font-serif text-2xl text-[#30372f]">{catalog.totalCount === 0 && !hasFilters ? "The shelves are getting ready." : "No products found."}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777c74]">{catalog.totalCount === 0 && !hasFilters ? "Add products to your catalogue to start showing your collection." : "Try a different search or adjust your filters to find what you’re looking for."}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
                {catalog.products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              {catalog.totalPages > 1 && (
                <nav aria-label="Product pages" className="mt-10 flex items-center justify-center gap-4">
                  {catalog.page > 1 ? <Link className="rounded-full border border-[#dcdcd4] px-4 py-2 text-sm text-[#4c554b] hover:bg-white" href={getPageHref(search, catalog.page - 1)}>Previous</Link> : <span className="rounded-full border border-[#ecebe6] px-4 py-2 text-sm text-[#a4a69f]">Previous</span>}
                  <span className="text-sm text-[#777c74]">Page {catalog.page} of {catalog.totalPages}</span>
                  {catalog.page < catalog.totalPages ? <Link className="rounded-full border border-[#dcdcd4] px-4 py-2 text-sm text-[#4c554b] hover:bg-white" href={getPageHref(search, catalog.page + 1)}>Next</Link> : <span className="rounded-full border border-[#ecebe6] px-4 py-2 text-sm text-[#a4a69f]">Next</span>}
                </nav>
              )}
            </>
          )}
        </>
      ) : null}
    </main>
  );
}

function ProductFilterForm({ filters, catalog }) {
  return (
    <form action="/products" className="mb-7 grid gap-3 rounded-2xl border border-[#e9e8e1] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5" method="get">
      <label className="text-xs font-medium text-[#62675f]">Search<input className="mt-1.5 w-full rounded-lg border border-[#e5e4dd] bg-[#fcfbf8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#81927e]" defaultValue={filters.q || ""} maxLength={100} name="q" placeholder="Search products" type="search" /></label>
      <label className="text-xs font-medium text-[#62675f]">Category<select className="mt-1.5 w-full rounded-lg border border-[#e5e4dd] bg-[#fcfbf8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#81927e]" defaultValue={filters.category || ""} name="category"><option value="">All categories</option>{catalog.categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
      <label className="text-xs font-medium text-[#62675f]">Brand<select className="mt-1.5 w-full rounded-lg border border-[#e5e4dd] bg-[#fcfbf8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#81927e]" defaultValue={filters.brand || ""} name="brand"><option value="">All brands</option>{catalog.brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
      <label className="text-xs font-medium text-[#62675f]">Sort by<select className="mt-1.5 w-full rounded-lg border border-[#e5e4dd] bg-[#fcfbf8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#81927e]" defaultValue={filters.sort || "newest"} name="sort"><option value="newest">Newest first</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option></select></label>
      <label className="text-xs font-medium text-[#62675f]">Minimum price (₹)<input className="mt-1.5 w-full rounded-lg border border-[#e5e4dd] bg-[#fcfbf8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#81927e]" defaultValue={filters.minPrice || ""} min="0" name="minPrice" type="number" /></label>
      <label className="text-xs font-medium text-[#62675f]">Maximum price (₹)<input className="mt-1.5 w-full rounded-lg border border-[#e5e4dd] bg-[#fcfbf8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#81927e]" defaultValue={filters.maxPrice || ""} min="0" name="maxPrice" type="number" /></label>
      <label className="text-xs font-medium text-[#62675f]">Minimum rating<select className="mt-1.5 w-full rounded-lg border border-[#e5e4dd] bg-[#fcfbf8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#81927e]" defaultValue={filters.minRating || ""} name="minRating"><option value="">Any rating</option><option value="3">3 stars &amp; up</option><option value="4">4 stars &amp; up</option><option value="4.5">4.5 stars &amp; up</option></select></label>
      <div className="flex items-end"><button className="w-full rounded-lg bg-[#35483a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#26372b]" type="submit">Apply filters</button></div>
    </form>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<main className="mx-auto min-h-[60vh] max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8"><ProductGridSkeleton /></main>}><ProductListing /></Suspense>;
}
