import { Suspense } from "react";
import ProductDetailsClient from "../../../components/ProductDetailsClient";

export default function ProductPage() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-[60vh] max-w-[1320px] animate-pulse px-4 py-12 sm:px-6 lg:px-8"><div className="grid gap-8 lg:grid-cols-2"><div className="aspect-square rounded-2xl bg-[#e9e8e2]" /><div className="h-72 rounded-2xl bg-[#e9e8e2]" /></div></main>}>
      <ProductDetailsClient />
    </Suspense>
  );
}
