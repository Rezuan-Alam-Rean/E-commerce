import { connectDb } from "@/lib/db";
import { OrderModel } from "@/models/order";
import { ProductModel } from "@/models/product";
import { UserModel } from "@/models/user";

export async function getAnalyticsSummary() {
  await connectDb();

  const [totalOrders, totalProducts, totalUsers, sales] = await Promise.all([
    OrderModel.countDocuments(),
    ProductModel.countDocuments(),
    UserModel.countDocuments(),
    OrderModel.aggregate<{ total: number }>([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  return {
    totalOrders,
    totalProducts,
    totalUsers,
    totalSales: sales[0]?.total ?? 0,
  };
}
