import { getAuthPayload } from "@/lib/auth";
import { getUserProfile } from "@/services/user.service";
import { ProfileForm } from "@/features/profile/profile-form";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const auth = await getAuthPayload();
  if (!auth) {
    return null;
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
