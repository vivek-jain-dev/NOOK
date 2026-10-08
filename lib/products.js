import prisma from "./prisma";

const PAGE_SIZE = 12;
const allowedSorts = new Set(["newest", "price-asc", "price-desc", "rating"]);

function readOptionalNumber(searchParams, name) {
  const value = searchParams.get(name);

  if (value === null || value.trim() === "") {
    return { value: null, error: null };
  }

  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return { value: null, error: `${name} must be a non-negative number.` };
  }

  return { value: number, error: null };
}

export function parseProductFilters(searchParams) {
  const query = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim().toLowerCase();
  const brand = (searchParams.get("brand") || "").trim();
  const sort = (searchParams.get("sort") || "newest").trim();
  const pageValue = searchParams.get("page") || "1";
  const page = Number(pageValue);
  const featured = searchParams.get("featured");
  const minPrice = readOptionalNumber(searchParams, "minPrice");
  const maxPrice = readOptionalNumber(searchParams, "maxPrice");
  const minRating = readOptionalNumber(searchParams, "minRating");

  if (query.length > 100) {
    return { error: "Search text must be 100 characters or fewer." };
  }

  if (category && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)) {
    return { error: "Choose a valid product category." };
  }

  if (brand.length > 80) {
    return { error: "Brand must be 80 characters or fewer." };
  }

  if (!Number.isInteger(page) || page < 1 || page > 10000) {
    return { error: "Page must be a positive whole number." };
  }

  if (!allowedSorts.has(sort)) {
    return { error: "Choose a valid sort order." };
  }

  if (featured !== null && featured !== "true" && featured !== "false") {
    return { error: "Choose a valid featured product filter." };
  }

  if (minPrice.error || maxPrice.error || minRating.error) {
    return { error: minPrice.error || maxPrice.error || minRating.error };
  }

  if (
    maxPrice.value !== null &&
    minPrice.value !== null &&
    maxPrice.value < minPrice.value
  ) {
    return {
      error: "Maximum price must be greater than or equal to minimum price.",
    };
  }

  if (minRating.value !== null && minRating.value > 5) {
    return { error: "Rating must be between 0 and 5." };
  }

  return {
    filters: {
      query,
      category,
      brand,
      sort,
      page,
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
      minRating: minRating.value,
      featured: featured === "true",
    },
  };
}

function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice,
    category: product.category?.name || "",
    categorySlug: product.category?.slug || "",
    brand: product.brand,
    images: JSON.parse(product.images),
    stock: product.stock,
    sku: product.sku,
    rating: product.rating,
    reviewCount: product.reviewCount,
    isFeatured: product.isFeatured,
    createdAt: product.createdAt?.toISOString() || null,
  };
}

export async function getProductCatalog(filters = {}) {
  const where = { isActive: true };

  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query } },
      { brand: { contains: filters.query } },
      { description: { contains: filters.query } },
    ];
  }

  if (filters.category) {
    where.category = { slug: filters.category, isActive: true };
  }

  if (filters.brand) {
    where.brand = filters.brand;
  }

  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    where.salePrice = { ...where.salePrice, gte: filters.minPrice };
  }

  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    where.salePrice = { ...where.salePrice, lte: filters.maxPrice };
  }

  if (filters.minRating !== null && filters.minRating !== undefined) {
    where.rating = { gte: filters.minRating };
  }

  if (filters.featured) {
    where.isFeatured = true;
  }

  const sortOrders = {
    newest: { createdAt: "desc" },
    "price-asc": { salePrice: "asc" },
    "price-desc": { salePrice: "desc" },
    rating: [{ rating: "desc" }, { reviewCount: "desc" }],
  };
  const page = filters.page || 1;
  const pageSize = filters.pageSize || PAGE_SIZE;

  const [products, totalCount, categories, brandRows] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: sortOrders[filters.sort] || sortOrders.newest,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      distinct: ["brand"],
      select: { brand: true },
    }),
  ]);

  return {
    products: products.map(serializeProduct),
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    categories,
    brands: brandRows
      .map((product) => product.brand)
      .filter(Boolean)
      .sort((first, second) => first.localeCompare(second)),
  };
}

export async function getProductById(id) {
  if (typeof id !== "string" || id.length > 30) {
    return null;
  }

  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: { category: { select: { name: true, slug: true } } },
  });

  return product ? serializeProduct(product) : null;
}
