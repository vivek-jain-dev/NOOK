import { getProductCatalog, parseProductFilters } from "../../../lib/products";

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const result = parseProductFilters(searchParams);

  if (result.error) {
    return Response.json(
      { success: false, error: result.error },
      { status: 400 },
    );
  }

  try {
    const catalog = await getProductCatalog(result.filters);
    return Response.json({ success: true, data: catalog });
  } catch (error) {
    console.error("Unable to load the product catalog:", error);
    return Response.json(
      { success: false, error: "Unable to load products. Please try again." },
      { status: 500 },
    );
  }
}
