import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SessionExpiredError } from "@/lib/api";
import { fetchProfiles } from "@/features/profiles/queries/fetch-profiles";
import { ProfileSelectionView } from "@/features/profiles/components/profile-selection-view";

export default async function ProfileSelectionPage() {
  let profiles;

  try {
    profiles = await fetchProfiles();
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      redirect("/sign-in?error=session_expired");
    }

    throw error;
  }

  return (
    <Suspense>
      <ProfileSelectionView profiles={profiles} />
    </Suspense>
  );
}
