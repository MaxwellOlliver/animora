import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import { serverEnv } from "./server-env";

export type SessionData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  profileId?: string;
};

export const SESSION_OPTIONS = {
  password: serverEnv.SESSION_SECRET,
  cookieName: "animora_session",
  cookieOptions: {
    httpOnly: true,
    secure: serverEnv.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const store = await cookies();
  return getIronSession<SessionData>(store, SESSION_OPTIONS);
}

export function decodeTokenExpiry(jwt: string): number {
  const payload = jwt.split(".")[1];
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
  return decoded.exp as number;
}
