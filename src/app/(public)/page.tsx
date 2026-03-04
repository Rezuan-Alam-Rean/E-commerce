import { HomeSlider } from "@/features/home/home-slider";
import { CategorySection } from "@/features/home/category-section";
import { FeaturedProducts } from "@/features/home/featured-products";
import { TrendingProducts } from "@/features/home/trending-products";
import { FlashSale } from "@/features/home/flash-sale";
import { Newsletter } from "@/features/home/newsletter";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <HomeSlider />
      <CategorySection />
      <FeaturedProducts />
      <TrendingProducts />
      <FlashSale />
      <Newsletter />
    </div>
  );
}
