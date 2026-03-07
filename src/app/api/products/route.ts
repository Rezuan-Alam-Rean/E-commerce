import { productQuerySchema, productSchema } from "@/lib/validators/product";
import { ok, fail } from "@/lib/response";
import { getAuthPayload } from "@/lib/auth";
import { createProduct, listProducts } from "@/services/product.service";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const query = productQuerySchema.parse(raw);

  const result = await listProducts({
    search: query.search,
    category: query.category,
    sort: query.sort,
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    featured: query.featured === "true",
    trending: query.trending === "true",
    flash: query.flash === "true",
  });

  return ok(result);
}

export async function POST(req: Request) {
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return fail("Forbidden", 403);
  }

  try {
    const raw = await req.json();
    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid product data";
      return fail(message, 400);
    }
    const product = await createProduct(parsed.data);
    return ok(product, 201);
  } catch {
    return fail("Unable to create product", 500);
  }
}
