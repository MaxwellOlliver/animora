import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ProfileSelectionView } from "@/features/profiles/components/profile-selection-view";
import { fetchProfiles } from "@/features/profiles/queries/fetch-profiles";
import { SessionExpiredError } from "@/lib/api";
import { ensureFreshSession } from "@/lib/ensure-fresh-session";

export default async function ProfileSelectionPage() {
  await ensureFreshSession("/profile-selection");
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
