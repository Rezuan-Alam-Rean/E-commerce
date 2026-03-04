import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { AuthRedirectModal } from "@/components/ui/auth-redirect-modal";

export const dynamic = "force-dynamic";

const panelImage =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80";

export default async function LoginPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16 md:flex-row">
      <AuthRedirectModal />
      <div className="flex flex-1 flex-col justify-between rounded-[32px] bg-white p-10 shadow-[var(--shadow)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Returning customer
          </p>
          <h1 className="mt-4 font-serif text-3xl text-foreground">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Access your orders, wishlist, and enterprise pricing.
          </p>
        </div>
        <div className="mt-8">
          <AuthForm mode="login" />
        </div>
        <p className="mt-6 text-xs text-muted">
          New here?{" "}
          <Link href="/register" className="font-semibold text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-gradient-to-br from-[#f2e7d6] via-[#e7d2b6] to-[#d6b68b] p-10 text-foreground">
        <Image
          src={panelImage}
          alt="Featured"
          fill
          className="object-cover opacity-70"
          unoptimized
        />
        <div className="relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">Member perks</p>
          <h2 className="mt-4 font-serif text-3xl">
            Exclusive drops and curated bundles.
          </h2>
        </div>
        <p className="text-sm">
          Join the enterprise program to unlock priority restocks and order insights.
        </p>
        </div>
      </div>
    </section>
  );
}
