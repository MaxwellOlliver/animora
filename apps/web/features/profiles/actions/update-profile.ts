"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { ActionResult } from "@/lib/action";
import { profileSchema } from "@/features/profiles/schemas/profile";

export async function updateProfile(
  profileId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    avatarId: formData.get("avatarId"),
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await api(`/profiles/${profileId}`, {
      method: "PATCH",
      body: parsed.data,
      persistSession: true,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { error: "Profile or avatar was not found" };
    }

    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/profile-selection");
  revalidatePath(`/profile-edit/${profileId}`);
  redirect("/profile-selection");
}
