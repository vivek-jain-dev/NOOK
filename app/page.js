import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import HomeFeaturedProducts from "../components/HomeFeaturedProducts";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import StoreIcon from "../components/StoreIcon";
import { categories } from "../lib/store-data";

const reasons = [
  {
    icon: "truck",
    title: "Thoughtful delivery",
    description: "Carefully packed, and free on orders over ₹1,999.",
  },
  {
    icon: "return",
    title: "Easy returns",
    description: "A simple 7-day return window, no awkward questions.",
  },
  {
    icon: "shield",
    title: "Made to be loved",
    description: "A considered edit of pieces made for everyday life.",
  },
];

export default function HomePage() {
  return (
    <main id="top">
      <section className="mx-auto grid max-w-[1320px] gap-8 px-4 pb-14 pt-7 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-24">
        <div className="relative z-10 py-3 lg:py-12">
          <p className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526b57]">
            <span className="h-px w-7 bg-[#8a9b84]" />
            The little things, made better
          </p>
          <h1 className="max-w-xl font-serif text-[clamp(2.8rem,6vw,5.6rem)] leading-[0.98] tracking-[-0.055em] text-[#252b25]">
            Thoughtful finds for the way you <em className="font-normal">live.</em>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-[#70756d] sm:text-base">
            A considered collection of everyday things for home, work, and
            everywhere in between.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              className="inline-flex items-center gap-3 rounded-full bg-[#35483a] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#26372b]"
              href="#featured"
            >
              Explore the collection
              <StoreIcon name="arrow" className="h-4 w-4" />
            </Link>
            <span className="text-xs text-[#85897f]">Thoughtfully picked. Happily kept.</span>
          </div>
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["A", "M", "S"].map((initial, index) => (
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#faf9f6] text-[10px] font-semibold text-white ${
                    ["bg-[#9c755f]", "bg-[#687c6b]", "bg-[#b99872]"][index]
                  }`}
                  key={initial}
                >
                  {initial}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#70756d]">
              <span className="font-semibold text-[#29352d]">4.9/5</span> from
              2,000+ happy homes
            </p>
          </div>
        </div>

        <div className="relative min-h-[340px] overflow-hidden rounded-[28px] bg-[#e8e7df] sm:min-h-[470px] lg:min-h-[570px]">
          <Image
            alt="Calm, sunlit living space with thoughtfully chosen home pieces"
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18221a]/25 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 rounded-2xl border border-white/40 bg-white/90 px-4 py-3.5 shadow-sm backdrop-blur sm:bottom-7 sm:left-7 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a8076]">
              A softer kind of shopping
            </p>
            <p className="mt-1 text-sm font-medium text-[#2d352e]">
              Find your everyday favourite.
            </p>
          </div>
        </div>
      </section>

      <div className="border-y border-[#ebeae4] bg-white/60">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-4 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ["01", "A considered collection"],
            ["02", "Quality you can feel"],
            ["03", "Here when you need us"],
          ].map(([number, label]) => (
            <div className="flex items-center justify-center gap-3" key={number}>
              <span className="font-serif text-sm italic text-[#8a9b84]">{number}</span>
              <span className="text-xs font-medium text-[#62675f]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <section
        className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        id="categories"
      >
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7b8978]">
              Browse by mood
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#293029] sm:text-4xl">
              Find your kind of good.
            </h2>
          </div>
          <Link
            className="hidden items-center gap-2 pb-1 text-sm text-[#526b57] transition-colors hover:text-[#29352d] sm:flex"
            href="#featured"
          >
            See everything <StoreIcon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              className="group relative min-h-[190px] overflow-hidden rounded-2xl bg-[#e8e7df] sm:min-h-[260px]"
              href="#featured"
              key={category.name}
            >
              <Image
                alt=""
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 48vw, 25vw"
                src={category.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/75">
                  0{index + 1} / Discover
                </span>
                <h3 className="mt-1 text-sm font-medium sm:text-base">{category.name}</h3>
                <p className="mt-1 text-[11px] text-white/75 sm:text-xs">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#f1f1eb]" id="featured">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7b8978]">
                A few favourites
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#293029] sm:text-4xl">
                The good things edit.
              </h2>
              <p className="mt-2 text-sm text-[#777c74]">
                Tried, loved, and ready to find a new home.
              </p>
            </div>
            <Link
              className="hidden items-center gap-2 pb-1 text-sm text-[#526b57] transition-colors hover:text-[#29352d] sm:flex"
              href="/products"
            >
              Shop all <StoreIcon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <HomeFeaturedProducts />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[26px] bg-[#34483a] px-6 py-10 text-white sm:px-12 sm:py-14 lg:px-16">
          <div className="absolute -right-16 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-5 -top-20 h-60 w-60 rounded-full border border-white/10" />
          <div className="relative max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d6dfd1]">
              A little welcome from us
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.04em] sm:text-4xl">
              Make room for something lovely.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
              Find the considered pieces you&apos;ll reach for, gift often, and
              keep close for years to come.
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-medium text-[#34483a] transition-colors hover:bg-[#edf0e9]"
              href="#featured"
            >
              Find your favourite
              <StoreIcon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[#ebeae4] bg-white/50" id="our-story">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7b8978]">
              The Nook difference
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#293029] sm:text-4xl">
              Good things, thoughtfully chosen.
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {reasons.map((reason) => (
              <div className="text-center" key={reason.title}>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e9eee7] text-[#526b57]">
                  <StoreIcon name={reason.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-[#30372f]">
                  {reason.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#777c74]">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
