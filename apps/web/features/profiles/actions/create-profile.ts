"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { ActionResult } from "@/lib/action";
import { profileSchema } from "@/features/profiles/schemas/profile";

export async function createProfile(
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
    await api("/profiles", {
      method: "POST",
      body: parsed.data,
      persistSession: true,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        return { error: "Selected avatar was not found" };
      }

      if (error.status === 409) {
        return { error: "Maximum of 5 profiles reached" };
      }
    }

    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/profile-selection");
  redirect("/profile-selection");
}
