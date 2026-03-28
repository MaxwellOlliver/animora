"use server";

import { redirect } from "next/navigation";
import { setProfileId } from "@/lib/session";

export async function selectProfile(profileId: string) {
  await setProfileId(profileId);
  redirect("/home");
}
