import { createProfile } from "@/features/profiles/actions/create-profile";
import { ProfileEditorScreen } from "@/features/profiles/components/profile-editor-screen";

export default function ProfileCreatePage() {
  return <ProfileEditorScreen title="New profile" submitAction={createProfile} />;
}
