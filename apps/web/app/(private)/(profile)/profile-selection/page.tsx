import { Suspense } from "react";
import { fetchProfiles } from "@/features/profiles/queries/fetch-profiles";
import { ProfileSelectionView } from "@/features/profiles/components/profile-selection-view";

export default async function ProfileSelectionPage() {
  const profiles = await fetchProfiles();

  return (
    <Suspense>
      <ProfileSelectionView profiles={profiles} />
    </Suspense>
  );
}
