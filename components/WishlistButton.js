"use client";

import { useEffect, useState } from "react";
import StoreIcon from "./StoreIcon";
import {
  readWishlist,
  toggleWishlist,
  WISHLIST_UPDATED_EVENT,
} from "../lib/wishlist";

export default function WishlistButton({ productId }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const update = () => setSaved(readWishlist().includes(productId));
    update();
    window.addEventListener(WISHLIST_UPDATED_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [productId]);

  return (
    <button
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#526b57] shadow-sm transition-colors hover:bg-[#f1f3ee]"
      onClick={() => setSaved(toggleWishlist(productId))}
      type="button"
    >
      <StoreIcon
        name="heart"
        className={`h-5 w-5 ${saved ? "fill-[#526b57]" : ""}`}
      />
    </button>
  );
}
