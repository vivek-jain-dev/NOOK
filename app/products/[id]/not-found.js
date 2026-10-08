import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex min-h-[55vh] max-w-[720px] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7b8978]">
        Not on our shelves
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#293029]">
        We couldn&apos;t find that product.
      </h1>
      <p className="mt-3 text-sm text-[#777c74]">
        It may have moved or is no longer available.
      </p>
      <Link
        className="mt-7 rounded-full bg-[#35483a] px-5 py-3 text-sm font-medium text-white hover:bg-[#26372b]"
        href="/products"
      >
        Browse the collection
      </Link>
    </main>
  );
}
