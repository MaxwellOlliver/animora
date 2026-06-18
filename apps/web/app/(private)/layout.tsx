import { ProfileProvider } from "@/features/profiles/components/profile-provider";
import { getCurrentProfile } from "@/features/profiles/queries/get-current-profile";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return <ProfileProvider initialProfile={profile}>{children}</ProfileProvider>;
}
