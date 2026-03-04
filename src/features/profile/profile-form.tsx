"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone ?? "",
    address: profile.address ?? "",
    avatar: profile.avatar ?? "",
  });
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar ?? "");
  const { push } = useToast();

  const updateField = (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      push({ title: "Update failed", description: "Try again." });
      return;
    }
    const data = await res.json().catch(() => null);
    if (data?.success && data.data) {
      setForm({
        name: data.data.name ?? form.name,
        phone: data.data.phone ?? "",
        address: data.data.address ?? "",
        avatar: data.data.avatar ?? "",
      });
      setAvatarPreview(data.data.avatar ?? "");
    }
    push({ title: "Profile updated" });
  };

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-surface-strong">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={avatarPreview}
              src={avatarPreview}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted">
              {form.name.trim().slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Upload photo
          <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-muted">
            Save changes to apply
          </span>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full rounded-full border border-border bg-white px-4 py-2 text-xs"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              if (file.size > 5 * 1024 * 1024) {
                push({ title: "Image too large", description: "Upload a file under 5MB." });
                return;
              }
              const previewUrl = URL.createObjectURL(file);
              setAvatarPreview(previewUrl);
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  setForm((prev) => ({ ...prev, avatar: reader.result as string }));
                }
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
      </div>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Name
        <Input value={form.name} onChange={updateField("name")} placeholder="Name" />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Phone
        <Input value={form.phone} onChange={updateField("phone")} placeholder="Phone" />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Address
        <Input
          value={form.address}
          onChange={updateField("address")}
          placeholder="Address"
        />
      </label>
      <Button type="submit">Save changes</Button>
    </form>
  );
}
