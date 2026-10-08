export const CART_STORAGE_KEY = "nook-cart";
export const CART_UPDATED_EVENT = "nook-cart-updated";

export function readCart() {
  try {
    const data = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data.filter((item) =>
      item && typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity > 0
    ) : [];
  } catch {
    return [];
  }
}

export function writeCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(product, quantity = 1) {
  const cart = readCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity = Math.min(20, existing.quantity + quantity);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.salePrice,
      image: product.image,
      quantity: Math.min(20, quantity),
    });
  }
  writeCart(cart);
}
