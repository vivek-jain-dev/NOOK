export const WISHLIST_STORAGE_KEY = "nook-wishlist";
export const WISHLIST_UPDATED_EVENT = "nook-wishlist-updated";

export function readWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || "[]");
    return Array.isArray(saved)
      ? saved.filter((id) => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeWishlist(ids) {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
}

export function toggleWishlist(id) {
  const ids = readWishlist();
  const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  writeWishlist(next);
  return next.includes(id);
}
