"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function selectProfile(profileId: string) {
  const session = await getSession();
  session.profileId = profileId;
  await session.save();
  redirect("/home");
}
