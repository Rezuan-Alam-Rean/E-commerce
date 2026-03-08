import Link from "next/link";
import { getAuthPayload } from "@/lib/auth";
import { getUserProfile } from "@/services/user.service";
import { ProfileForm } from "@/features/profile/profile-form";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const auth = await getAuthPayload();
  if (!auth) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface-strong p-8 text-center">
        <h2 className="text-2xl font-semibold text-foreground">প্রোফাইল আপডেট করতে সাইন ইন করুন</h2>
        <p className="mt-2 text-sm text-muted">
          ঠিকানা ও যোগাযোগের তথ্য সংরক্ষণ করতে একটি অ্যাকাউন্ট প্রয়োজন।
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-foreground px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white font-english"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-border px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground font-english"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const profile = await getUserProfile(auth.userId);
  if (!profile) {
    return (
      <EmptyState
        title="Profile missing"
        description="We could not load your profile."
      />
    );
  }

  return <ProfileForm profile={profile} />;
}
