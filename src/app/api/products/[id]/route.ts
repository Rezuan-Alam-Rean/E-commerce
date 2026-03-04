import { parseBody } from "@/lib/validation";
import { productSchema } from "@/lib/validators/product";
import { ok, fail } from "@/lib/response";
import { getAuthPayload } from "@/lib/auth";
import { deleteProduct, getProductById, updateProduct } from "@/services/product.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return fail("Product not found", 404);
  }
  return ok(product);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return fail("Forbidden", 403);
  }

  const body = await parseBody(req, productSchema.partial());
  const product = await updateProduct(id, body);
  if (!product) {
    return fail("Product not found", 404);
  }
  return ok(product);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return fail("Forbidden", 403);
  }

  await deleteProduct(id);
  return ok({ id });
}
