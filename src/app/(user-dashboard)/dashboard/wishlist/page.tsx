import { WishlistView } from "@/features/wishlist/wishlist-view";

export default function WishlistPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-foreground">উইশলিস্ট</h1>
      <div className="mt-6">
        <WishlistView />
      </div>
    </section>
  );
}
