import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { deleteCategory } from "@/services/category.service";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return fail("Forbidden", 403);
  }

  const { id } = await params;
  await deleteCategory(id);
  return ok({ id });
}
