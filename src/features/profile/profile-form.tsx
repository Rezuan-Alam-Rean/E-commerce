"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfileMutation } from "@/lib/store/api";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone ?? "",
    address: profile.address ?? "",
    avatar: profile.avatar ?? "",
  });
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar ?? "");
  const { push } = useToast();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const updateField = (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const updatedProfile = await updateProfile(form).unwrap();
      setForm({
        name: updatedProfile.name ?? form.name,
        phone: updatedProfile.phone ?? "",
        address: updatedProfile.address ?? "",
        avatar: updatedProfile.avatar ?? "",
      });
      setAvatarPreview(updatedProfile.avatar ?? "");
      push({ title: "Profile updated" });
    } catch (error) {
      push({ title: "Update failed", description: resolveErrorMessage(error) });
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="flex flex-col gap-5 rounded-[32px] border border-[#e6d7be] bg-gradient-to-r from-[#fff8ef] via-white to-[#f2f8f5] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-white shadow-lg">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={avatarPreview}
                src={avatarPreview}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0f5132]/5 text-lg font-semibold text-[#0f5132]">
                {form.name.trim().slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6b5c4a]">
              Profile photo
            </p>
            <p className="text-[11px] text-muted">PNG, JPG up to 5MB</p>
          </div>
        </div>
        <label className="flex-1 space-y-2 rounded-2xl border border-[#dcd1be] bg-white/90 p-4 text-left shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5c4a]">
            Upload photo
          </span>
          <input
            type="file"
            accept="image/*"
            className="w-full cursor-pointer rounded-2xl border border-dashed border-[#e3d6c1] bg-[#faf4ea] px-4 py-3 text-xs"
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
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Save changes to apply</p>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 rounded-2xl border border-[#e6d7be] bg-white/90 p-5 text-left shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5c4a]">Name</span>
          <Input
            value={form.name}
            onChange={updateField("name")}
            placeholder="Name"
            className="rounded-2xl border border-transparent bg-[#f9f4ec] px-4 py-3 text-base focus:border-[#0f5132] focus:bg-white"
          />
        </label>
        <label className="flex flex-col gap-2 rounded-2xl border border-[#e6d7be] bg-white/90 p-5 text-left shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5c4a]">Phone</span>
          <Input
            value={form.phone}
            onChange={updateField("phone")}
            placeholder="Phone"
            className="rounded-2xl border border-transparent bg-[#f9f4ec] px-4 py-3 text-base focus:border-[#0f5132] focus:bg-white"
          />
        </label>
        <label className="md:col-span-2 flex flex-col gap-2 rounded-2xl border border-[#e6d7be] bg-white/90 p-5 text-left shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5c4a]">Address</span>
          <Input
            value={form.address}
            onChange={updateField("address")}
            placeholder="Address"
            className="rounded-2xl border border-transparent bg-[#f9f4ec] px-4 py-3 text-base focus:border-[#0f5132] focus:bg-white"
          />
        </label>
      </div>
      <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
