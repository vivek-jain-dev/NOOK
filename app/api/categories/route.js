import { connection } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(request) {
  await connection();
  const slug = new URL(request.url).searchParams.get("slug");

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return Response.json(
      { success: false, error: "Choose a valid category slug." },
      { status: 400 },
    );
  }

  try {
    const query = { isActive: true };

    if (slug) {
      query.slug = slug.toLowerCase();
    }

    const categories = await prisma.category.findMany({
      where: query,
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true },
    });

    return Response.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Unable to load product categories:", error);
    return Response.json(
      { success: false, error: "Unable to load categories. Please try again." },
      { status: 500 },
    );
  }
}
