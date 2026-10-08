import prisma from "../lib/prisma.js";

const categories = [
  {
    name: "Home & living",
    slug: "home-living",
    description: "Thoughtful details for a more welcoming home.",
  },
  {
    name: "Everyday style",
    slug: "everyday-style",
    description: "Easy pieces to wear and reach for on repeat.",
  },
  {
    name: "Bags & accessories",
    slug: "bags-accessories",
    description: "Useful finishing touches for every day.",
  },
  {
    name: "Daily essentials",
    slug: "daily-essentials",
    description: "Well-made essentials for everyday routines.",
  },
  {
    name: "Tech & audio",
    slug: "tech-audio",
    description: "Considered technology for work and play.",
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Comfortable companions for the everyday.",
  },
];

const products = [
  {
    name: "Studio wireless headphones",
    description:
      "Comfortable over-ear headphones with clear sound, soft cushions, and a long-lasting battery for your everyday listening.",
    price: 5999,
    salePrice: 4499,
    category: "tech-audio",
    brand: "Nook Audio",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
    stock: 28,
    sku: "NA-HEAD-001",
    rating: 4.9,
    reviewCount: 42,
    isFeatured: true,
  },
  {
    name: "Everyday timepiece",
    description:
      "A clean, easy-to-wear watch with a minimal dial and a comfortable strap that moves from weekdays to weekends.",
    price: 4299,
    salePrice: 3499,
    category: "bags-accessories",
    brand: "Field Notes",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
    stock: 16,
    sku: "FN-WATCH-002",
    rating: 4.8,
    reviewCount: 35,
    isFeatured: true,
  },
  {
    name: "Weekend runner",
    description:
      "A cushioned everyday trainer designed for comfortable city walks, easy runs, and busy days on your feet.",
    price: 6499,
    salePrice: 5199,
    category: "footwear",
    brand: "Common Ground",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85",
    stock: 22,
    sku: "CG-SHOE-003",
    rating: 4.9,
    reviewCount: 58,
    isFeatured: true,
  },
  {
    name: "Pocket film camera",
    description:
      "A compact digital camera with simple controls, made for collecting everyday moments and weekend memories.",
    price: 8999,
    salePrice: 7499,
    category: "tech-audio",
    brand: "Nook Audio",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85",
    stock: 9,
    sku: "NA-CAM-004",
    rating: 4.7,
    reviewCount: 19,
    isFeatured: true,
  },
  {
    name: "Soft cotton everyday tee",
    description:
      "A breathable cotton T-shirt with an easy fit and a soft feel, made to become a reliable part of your weekly rotation.",
    price: 1599,
    salePrice: 1299,
    category: "everyday-style",
    brand: "Kindred",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
    stock: 40,
    sku: "KD-TEE-005",
    rating: 4.6,
    reviewCount: 24,
    isFeatured: false,
  },
  {
    name: "Market canvas tote",
    description:
      "A sturdy, roomy cotton-canvas tote for errands, library trips, and all the little things you carry through the day.",
    price: 1199,
    salePrice: 899,
    category: "bags-accessories",
    brand: "Field Notes",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85",
    stock: 35,
    sku: "FN-TOTE-006",
    rating: 4.8,
    reviewCount: 31,
    isFeatured: false,
  },
  {
    name: "Stoneware morning mug",
    description:
      "A hand-finished stoneware mug with a comfortable handle and a softly textured glaze. Each piece has its own character.",
    price: 899,
    salePrice: 749,
    category: "home-living",
    brand: "Still House",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85",
    stock: 18,
    sku: "SH-MUG-007",
    rating: 4.9,
    reviewCount: 46,
    isFeatured: false,
  },
  {
    name: "Reading corner table lamp",
    description:
      "A compact table lamp with a warm, soft glow for bedside tables, reading corners, and small workspaces.",
    price: 3499,
    salePrice: 2999,
    category: "home-living",
    brand: "Still House",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85",
    stock: 12,
    sku: "SH-LAMP-008",
    rating: 4.7,
    reviewCount: 14,
    isFeatured: false,
  },
  {
    name: "Daily carry crossbody",
    description:
      "A lightweight crossbody bag with considered pockets for the small essentials you like to keep close.",
    price: 2799,
    salePrice: 2299,
    category: "bags-accessories",
    brand: "Kindred",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85",
    stock: 14,
    sku: "KD-BAG-009",
    rating: 4.5,
    reviewCount: 12,
    isFeatured: false,
  },
  {
    name: "Soft knit house slippers",
    description:
      "A comfortable pair of indoor slippers with a soft knit upper and a cushioned sole for slower mornings at home.",
    price: 1899,
    salePrice: 1499,
    category: "footwear",
    brand: "Common Ground",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=85",
    stock: 20,
    sku: "CG-SLIP-010",
    rating: 4.6,
    reviewCount: 17,
    isFeatured: false,
  },
];

async function seedProducts() {
  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      create: categoryData,
      update: categoryData,
    });
  }

  for (const productData of products) {
    const { category, image, ...productFields } = productData;

    await prisma.product.upsert({
      where: { sku: productFields.sku },
      create: {
        ...productFields,
        images: JSON.stringify([image]),
        isActive: true,
        category: { connect: { slug: category } },
      },
      update: {
        ...productFields,
        images: JSON.stringify([image]),
        isActive: true,
        category: { connect: { slug: category } },
      },
    });
  }

  console.log(
    `Seeded ${categories.length} categories and ${products.length} products.`,
  );
}

seedProducts()
  .catch((error) => {
    console.error("Product seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
