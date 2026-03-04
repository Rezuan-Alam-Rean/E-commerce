import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { categorySchema } from "@/lib/validators/category";
import { createCategory, listCategories } from "@/services/category.service";

export async function GET() {
  const categories = await listCategories();
  return ok(categories);
}

export async function POST(req: Request) {
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return fail("Forbidden", 403);
  }

  const json = await req.json();
  const parsed = categorySchema.safeParse(json);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid category", 400);
  }

  const category = await createCategory(parsed.data.name);
  return ok(category, 201);
}
