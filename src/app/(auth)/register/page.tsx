import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { AuthRedirectModal } from "@/components/ui/auth-redirect-modal";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col justify-center min-h-[calc(100vh-80px)] gap-8 px-4 py-12 sm:py-20">
      <AuthRedirectModal />
      <div className="flex flex-col gap-2 text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight font-english">
          Join Network
        </h1>
        <p className="text-sm font-medium text-gray-500 font-english leading-relaxed px-4">
          Unlock district-wide delivery and real-time order tracking in seconds.
        </p>
      </div>

      <AuthForm mode="register" />

      <div className="rounded-[2.5rem] border border-gray-100 bg-white/50 backdrop-blur-xl p-6 text-center shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-english">
          Member already?
        </p>
        <Link 
          href="/login" 
          className="mt-3 inline-flex items-center gap-2 text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors font-english group"
        >
          Sign In to Account
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </div>
    </section>
  );
}
