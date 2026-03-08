import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { toSlug } from "@/lib/slug";
import { CategoryModel } from "@/models/category";

export async function listCategories() {
  await connectDb();
  const categories = await CategoryModel.find().sort({ name: 1 }).lean<Array<{
    _id: Types.ObjectId;
    name: string;
    slug: string;
  }>>();
  return categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
  }));
}

export async function createCategory(name: string) {
  await connectDb();
  const slug = toSlug(name);
  const category = await CategoryModel.create({ name, slug });
  return { id: category._id.toString(), name: category.name, slug: category.slug };
}

export async function deleteCategory(id: string) {
  await connectDb();
  await CategoryModel.findByIdAndDelete(id);
}
