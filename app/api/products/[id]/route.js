import { getProductById } from "../../../../lib/products";

export async function GET(_request, { params }) {
  const { id } = await params;

  if (typeof id !== "string" || id.length > 30) {
    return Response.json(
      { success: false, error: "Product not found." },
      { status: 404 },
    );
  }

  try {
    const product = await getProductById(id);

    if (!product) {
      return Response.json(
        { success: false, error: "Product not found." },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: product });
  } catch (error) {
    console.error("Unable to load the requested product:", error);
    return Response.json(
      { success: false, error: "Unable to load this product. Please try again." },
      { status: 500 },
    );
  }
}
