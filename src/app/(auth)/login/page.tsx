import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { AuthRedirectModal } from "@/components/ui/auth-redirect-modal";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <AuthRedirectModal />
      <div className="rounded-[40px] border border-[#eadfca] bg-gradient-to-br from-[#fff8ef] via-white to-[#f2f8f5] p-10 shadow-[0_30px_80px_rgba(9,50,32,0.12)]">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0f5132]/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0f5132]">
            Sign in
          </span>
          <h1 className="font-serif text-4xl text-foreground">Return to your Bangladesh storefront</h1>
          <p className="text-sm text-muted">
            Manage orders, wishlists, and delivery preferences with a single secure login.
          </p>
        </div>
        <div className="mt-8">
          <AuthForm mode="login" />
        </div>
        <div className="mt-8 rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-muted">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-foreground underline underline-offset-4">
            Create one now
          </Link>
        </div>
      </div>
    </section>
  );
}
