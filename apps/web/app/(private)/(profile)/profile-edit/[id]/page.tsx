import { redirect } from "next/navigation";
import { ApiError, SessionExpiredError } from "@/lib/api";
import { ProfileEditorScreen } from "@/features/profiles/components/profile-editor-screen";
import { fetchProfile } from "@/features/profiles/queries/fetch-profiles";
import { updateProfile } from "@/features/profiles/actions/update-profile";
import { buildMediaUrl } from "@/utils/media-utils";

type ProfileEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfileEditPage({
  params,
}: ProfileEditPageProps) {
  const { id } = await params;
  let profile;

  try {
    profile = await fetchProfile(id);
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      redirect("/sign-in?error=session_expired");
    }

    if (error instanceof ApiError && error.status === 404) {
      redirect("/profile-selection");
    }

    throw error;
  }

  const avatarPreview = profile.avatar?.picture
    ? buildMediaUrl(profile.avatar.picture.purpose, profile.avatar.picture.key)
    : undefined;

  return (
    <ProfileEditorScreen
      title="Edit profile"
      submitAction={updateProfile.bind(null, id)}
      defaultName={profile.name}
      defaultAvatarId={profile.avatarId}
      defaultAvatarPreview={avatarPreview}
    />
  );
}
