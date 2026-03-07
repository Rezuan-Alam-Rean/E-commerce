import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { AuthRedirectModal } from "@/components/ui/auth-redirect-modal";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <AuthRedirectModal />
      <div className="rounded-[40px] border border-[#eadfca] bg-gradient-to-br from-[#fff8ef] via-white to-[#f2f8f5] p-10 shadow-[0_30px_80px_rgba(9,50,32,0.12)]">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ba1b1d]/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#ba1b1d]">
            Join us
          </span>
          <h1 className="font-serif text-4xl text-foreground">Create a Bangladesh-first commerce identity</h1>
          <p className="text-sm text-muted">
            Unlock COD, bkash, and district-wide delivery control with a single account.
          </p>
        </div>
        <div className="mt-8">
          <AuthForm mode="register" />
        </div>
        <div className="mt-8 rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-muted">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-foreground underline underline-offset-4">
            Sign in instead
          </Link>
        </div>
      </div>
    </section>
  );
}
