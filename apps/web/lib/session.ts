import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

import { getServerEnv } from "./server-env";

export type SessionData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  profileId?: string;
};

export function getSessionOptions() {
  const { SESSION_SECRET, NODE_ENV } = getServerEnv();

  return {
    password: SESSION_SECRET,
    cookieName: "animora_session",
    cookieOptions: {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const store = await cookies();
  return getIronSession<SessionData>(store, getSessionOptions());
}

export function decodeTokenExpiry(jwt: string): number {
  const payload = jwt.split(".")[1];
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
  return decoded.exp as number;
}
