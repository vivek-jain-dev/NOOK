export default function ProductGridSkeleton({ count = 4 }) {
  return (
    <div
      aria-label="Loading products"
      aria-live="polite"
      className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      role="status"
    >
      {Array.from({ length: count }, (_, index) => (
        <div className="animate-pulse" key={index}>
          <div className="aspect-[4/4.6] rounded-2xl bg-[#e9e8e2]" />
          <div className="mt-4 h-3 w-2/5 rounded bg-[#e9e8e2]" />
          <div className="mt-2 h-4 w-3/4 rounded bg-[#e9e8e2]" />
          <div className="mt-3 h-3 w-1/2 rounded bg-[#e9e8e2]" />
        </div>
      ))}
      <span className="sr-only">Loading products...</span>
    </div>
  );
}
