import { Suspense } from "react";
import ShoppingCart from "../../components/ShoppingCart";

export default function CartPage() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-[55vh] max-w-[1320px] px-4 py-14 text-center text-sm text-[#777c74] sm:px-6 lg:px-8">Loading your bag…</main>}>
      <ShoppingCart />
    </Suspense>
  );
}
