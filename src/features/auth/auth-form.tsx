"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLoginMutation, useRegisterMutation } from "@/lib/store/api";
import { trackMetaEvent } from "@/lib/analytics/meta-client";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { push } = useToast();
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const loading = mode === "register" ? registerLoading : loginLoading;

  const resolveErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error && "data" in error) {
      const data = (error as { data?: { error?: string } }).data;
      if (data && typeof data === "object" && "error" in data) {
        const message = (data as { error?: string }).error;
        if (typeof message === "string") {
          return message;
        }
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Try again.";
  };

  const updateField = (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "register" && form.name.trim().length < 2) {
      push({ title: "Name required", description: "Enter at least 2 characters." });
      return;
    }
    if (!form.email.includes("@")) {
      push({ title: "Email required", description: "Enter a valid email address." });
      return;
    }
    if (form.password.length < 6) {
      push({ title: "Password too short", description: "Use at least 6 characters." });
      return;
    }
    try {
      const user =
        mode === "register"
          ? await register({ name: form.name, email: form.email, password: form.password }).unwrap()
          : await login({ email: form.email, password: form.password }).unwrap();
      if (mode === "register") {
        const normalizedEmail = form.email.trim().toLowerCase();
        trackMetaEvent(
          "CompleteRegistration",
          undefined,
          {
            userData: {
              em: normalizedEmail ? [normalizedEmail] : undefined,
            },
          },
        );
      }
      push({ title: "Welcome back", description: "You are signed in." });
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      push({ title: "Authentication failed", description: resolveErrorMessage(error) });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 sm:space-y-8 rounded-[2.5rem] border border-gray-100 bg-white p-6 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)]"
    >
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex justify-center sm:justify-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 border border-emerald-100/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Secure Access
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-english">
          {mode === "register" ? "Create Identity" : "Welcome Back"}
        </h2>
        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs mx-auto sm:mx-0">
          {mode === "register" 
            ? "Join the premium Bangladesh-first commerce network." 
            : "Sign in to manage your orders and preferences."}
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {mode === "register" ? (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Full Name</label>
            <Input
              placeholder="E.g. Tanvir Alam"
              value={form.name}
              onChange={updateField("name")}
              className="rounded-2xl border-gray-100 bg-gray-50/50 px-5 py-4 text-base font-medium transition-all focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50"
              required
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Email Address</label>
          <Input
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={updateField("email")}
            className="rounded-2xl border-gray-100 bg-gray-50/50 px-5 py-4 text-base font-medium transition-all focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Secure Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={updateField("password")}
            className="rounded-2xl border-gray-100 bg-gray-50/50 px-5 py-4 text-base font-medium transition-all focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0d111f] py-4 text-xs font-black uppercase tracking-[0.25em] text-white shadow-xl shadow-black/10 hover:bg-black hover:shadow-black/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none font-english"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            Processing...
          </span>
        ) : (
          mode === "register" ? "Create Account" : "Sign In Now"
        )}
      </button>
    </form>
  );
}
