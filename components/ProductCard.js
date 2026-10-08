import Image from "next/image";
import Link from "next/link";
import StoreIcon from "./StoreIcon";
import WishlistButton from "./WishlistButton";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product }) {
  const discount =
    product.price > 0
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;
  const image = product.images?.[0] || product.image;

  return (
    <article className="product-card group min-w-0">
      <div className="relative">
        <Link
          aria-label={`View ${product.name}`}
          className="relative block aspect-[4/4.6] overflow-hidden rounded-2xl bg-[#efeee8]"
          href={product.id ? `/products/${product.id}` : "/products"}
        >
          <Image
            alt={product.imageAlt || product.name}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            fill
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 260px"
            src={image}
          />
          {product.isFeatured && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#526b57] backdrop-blur">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute inset-x-0 bottom-0 bg-[#29352d]/85 px-3 py-2 text-center text-xs font-medium text-white">
              Out of stock
            </span>
          )}
          <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#30372f] shadow-sm transition-transform group-hover:scale-105">
            <StoreIcon name="arrow" className="h-[18px] w-[18px]" />
          </span>
        </Link>
        {product.id && <WishlistButton productId={product.id} />}
      </div>
      <div className="flex items-start justify-between gap-3 pt-3.5">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#85897f]">
            {typeof product.category === "string"
              ? product.category
              : product.category?.name || "Everyday essentials"}
          </p>
          <h3 className="mt-1 truncate text-sm font-medium text-[#292d28] sm:text-[15px]">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm font-semibold text-[#29352d]">
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-xs text-[#92958e] line-through">
              {formatPrice(product.price)}
            </span>
            <span className="hidden text-[10px] text-[#526b57] sm:inline">
              {discount}% off
            </span>
          </div>
        </div>
        <span
        aria-label={`${Number(product.rating).toFixed(1)} out of 5 stars`}
          className="mt-1 flex shrink-0 items-center gap-1 text-xs text-[#696f64]"
        >
          <StoreIcon name="star" className="h-3 w-3 fill-[#bd8b4c] text-[#bd8b4c]" />
        {Number(product.rating).toFixed(1)}
        </span>
      </div>
    </article>
  );
}
