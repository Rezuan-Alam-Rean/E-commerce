"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

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
    setLoading(true);

    const payload =
      mode === "register"
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok || !data.success) {
      push({ title: "Authentication failed", description: data.error ?? "Try again." });
      return;
    }

    push({ title: "Welcome back", description: "You are signed in." });
    if (data.data.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[32px] border border-[#e0d6c8] bg-white/95 p-8 shadow-[0_25px_60px_rgba(15,40,30,0.12)]"
    >
      <div className="space-y-2 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Secure access
        </p>
        <h2 className="text-3xl font-semibold text-foreground">
          {mode === "register" ? "Create your commerce identity" : "Sign in to continue"}
        </h2>
        <p className="text-sm text-muted">
          Manage orders, wishlists, and delivery preferences from a single dashboard.
        </p>
      </div>
      {mode === "register" ? (
        <label className="flex flex-col gap-2 text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">Full name</span>
          <Input
            placeholder="Full name"
            value={form.name}
            onChange={updateField("name")}
            className="rounded-2xl border border-[#d6cab4] bg-white px-4 py-3 text-base text-foreground shadow-sm focus:border-[#0f5132]"
            required
          />
        </label>
      ) : null}
      <label className="flex flex-col gap-2 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">Email</span>
        <Input
          type="email"
          placeholder="you@email.com"
          value={form.email}
          onChange={updateField("email")}
          className="rounded-2xl border border-[#d6cab4] bg-white px-4 py-3 text-base text-foreground shadow-sm focus:border-[#0f5132]"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">Password</span>
        <Input
          type="password"
          placeholder="Minimum 6 characters"
          value={form.password}
          onChange={updateField("password")}
          className="rounded-2xl border border-[#d6cab4] bg-white px-4 py-3 text-base text-foreground shadow-sm focus:border-[#0f5132]"
          required
        />
      </label>
      <Button type="submit" disabled={loading} className="w-full rounded-[18px] py-3 shadow-lg">
        {loading ? "Processing" : mode === "register" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
