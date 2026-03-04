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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "register" ? (
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Full name
          <Input
            placeholder="Full name"
            value={form.name}
            onChange={updateField("name")}
            required
          />
        </label>
      ) : null}
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Email
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={updateField("email")}
          required
        />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Password
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={updateField("password")}
          required
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Processing" : mode === "register" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
