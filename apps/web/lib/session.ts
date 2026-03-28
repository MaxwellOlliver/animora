import { cookies } from "next/headers";

const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";
const PROFILE_ID = "profile_id";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function getSession() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN)?.value;
  const refreshToken = store.get(REFRESH_TOKEN)?.value;

  if (!accessToken) return null;

  return { accessToken, refreshToken };
}

export async function setTokens(accessToken: string, refreshToken: string) {
  const store = await cookies();

  store.set(ACCESS_TOKEN, accessToken, COOKIE_OPTIONS);
  store.set(REFRESH_TOKEN, refreshToken, { ...COOKIE_OPTIONS, path: "/" });
}

export async function clearTokens() {
  const store = await cookies();

  store.delete(ACCESS_TOKEN);
  store.delete(REFRESH_TOKEN);
  store.delete(PROFILE_ID);
}

export async function getProfileId() {
  const store = await cookies();
  return store.get(PROFILE_ID)?.value ?? null;
}

export async function setProfileId(profileId: string) {
  const store = await cookies();
  store.set(PROFILE_ID, profileId, {
    ...COOKIE_OPTIONS,
    httpOnly: false,
  });
}

export async function clearProfileId() {
  const store = await cookies();
  store.delete(PROFILE_ID);
}
