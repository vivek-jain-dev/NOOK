import Link from "next/link";

const footerLinks = [
  { label: "Shop all", href: "/products" },
  { label: "My account", href: "/account" },
  { label: "Contact us", href: "mailto:hello@nookandco.example" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#e8e7e0] bg-[#f3f2ed]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div className="max-w-sm">
          <Link className="text-lg font-semibold tracking-[-0.04em]" href="/">
            nook <span className="font-normal text-[#81857c]">& co.</span>
          </Link>
          <p className="mt-3 text-sm leading-6 text-[#6f746e]">
            Thoughtful finds, made for everyday living. Good things should feel
            good to bring home.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#62675f]">
          {footerLinks.map((link) => (
            <Link
              className="transition-colors hover:text-[#29352d]"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-[#e6e5de]">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-4 py-4 text-xs text-[#81857c] sm:px-6 md:flex-row md:flex-wrap md:justify-between lg:px-8">
          <p>© 2026 Nook & Co. All rights reserved.</p>
          <p>Made for slower, more thoughtful living.</p>
          <p>designed &amp; Powered By Vivek Jain + 91-9588611472</p>
        </div>
      </div>
    </footer>
  );
}
