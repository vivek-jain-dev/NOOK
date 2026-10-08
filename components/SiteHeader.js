import Link from "next/link";
import StoreIcon from "./StoreIcon";
import CartCount from "./CartCount";

const navigationLinks = [
  { label: "Shop all", href: "/products" },
  { label: "Home", href: "/#categories" },
  { label: "Our story", href: "/#our-story" },
];

function SearchForm({ mobile = false }) {
  return (
    <form
      action="/products"
      className={`flex items-center gap-2 rounded-full border border-[#e7e6e0] bg-[#f7f6f2] px-4 py-2.5 ${
        mobile ? "md:hidden" : "hidden w-full max-w-md lg:flex"
      }`}
      role="search"
    >
      <StoreIcon name="search" className="h-[18px] w-[18px] shrink-0 text-[#74796f]" />
      <input
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8a8e85]"
        name="q"
        placeholder="Search for something lovely..."
        type="search"
      />
      <button
        aria-label="Submit search"
        className="sr-only"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#eae9e3] bg-[#faf9f6]/95 backdrop-blur">
      <div className="bg-[#29352d] px-4 py-2 text-center text-[11px] font-medium tracking-[0.08em] text-white sm:text-xs">
        A little something extra: complimentary delivery on orders over ₹1,999
      </div>
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          aria-label="Nook and Co. home"
          className="flex shrink-0 items-center gap-2.5"
          href="/"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#526b57] font-serif text-lg font-semibold text-white">
            n.
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.04em] sm:text-lg">
            nook<span className="font-normal text-[#81857c]"> & co.</span>
          </span>
        </Link>

        <SearchForm />

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            aria-label="Your account"
            className="hidden items-center gap-2 text-sm text-[#424940] transition-colors hover:text-[#526b57] sm:flex"
            href="/account"
          >
            <StoreIcon name="user" />
            <span className="hidden xl:inline">Account</span>
          </Link>
          <Link
            aria-label="Wishlist"
            className="hidden text-[#424940] transition-colors hover:text-[#526b57] sm:block"
            href="/account/wishlist"
          >
            <StoreIcon name="heart" />
          </Link>
          <Link
            aria-label="Shopping bag"
            className="relative text-[#424940] transition-colors hover:text-[#526b57]"
            href="/cart"
          >
            <StoreIcon name="bag" />
            <CartCount />
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1320px] px-4 pb-3 sm:px-6 lg:px-8">
        <SearchForm mobile />
      </div>
      <nav
        aria-label="Main navigation"
        className="hidden justify-center gap-10 border-t border-[#eeede7] py-3 text-[13px] text-[#60665e] md:flex"
      >
        {navigationLinks.map((link) => (
          <Link
            className="transition-colors hover:text-[#526b57]"
            href={link.href}
            key={link.label}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
