import "server-only";

import { getSession } from "@/lib/session";

import { fetchProfile } from "./fetch-profiles";

export async function getCurrentProfile() {
  const session = await getSession();
  if (!session.profileId) return null;
  return fetchProfile(session.profileId).catch(() => null);
}
