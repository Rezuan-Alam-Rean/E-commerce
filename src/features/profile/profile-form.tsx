"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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
        if (typeof message === "string") return message;
      }
    }
    if (error instanceof Error) return error.message;
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
      push({ title: "Profile updated successfully" });
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

  const fieldClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition font-english";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black text-gray-900 font-english mb-1">My Profile</h2>
        <p className="text-sm text-gray-500 font-medium">Manage your personal information and delivery preferences.</p>
      </div>

      {/* Avatar Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-900 font-english mb-5 border-b border-gray-100 pb-4">
          Profile Photo
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Preview */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-gray-100 bg-gray-50 shadow-sm">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={avatarPreview} src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-2xl font-black text-gray-400 font-english">
                {form.name.trim().slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 w-full">
            <p className="text-sm font-bold text-gray-900 font-english mb-1">Upload a new photo</p>
            <p className="text-xs text-gray-500 mb-3">PNG or JPG, up to 5MB. This appears on your account.</p>
            <label className="flex items-center gap-3 cursor-pointer w-full sm:w-auto">
              <span className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all font-english whitespace-nowrap">
                Choose File
              </span>
              <span className="text-xs text-gray-400 font-medium truncate">
                {avatarPreview && !avatarPreview.startsWith("blob:") ? "Photo uploaded" : "No file chosen"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
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
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-6 md:p-8">
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-900 font-english mb-6 border-b border-gray-100 pb-4">
          Personal Information
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english">
            Full Name
            <Input
              value={form.name}
              onChange={updateField("name")}
              placeholder="Your full name"
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english">
            Phone Number
            <Input
              value={form.phone}
              onChange={updateField("phone")}
              placeholder="e.g. +880 1712 345678"
              inputMode="tel"
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english md:col-span-2">
            Delivery Address
            <Input
              value={form.address}
              onChange={updateField("address")}
              placeholder="Your default shipping address"
              className={fieldClass}
            />
          </label>
        </div>
      </div>

      {/* Account Info (read-only display) */}
      <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 rounded-full bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 font-english">Your email cannot be changed</p>
            <p className="text-xs text-gray-500 mt-0.5">To update your email address, please contact support.</p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-english"
        >
          {isLoading ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></span>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
