import "server-only";

import { redirect } from "next/navigation";
import { needsRefresh } from "./refresh-mutex";
import { getSession } from "./session";

export async function ensureFreshSession(returnTo: string): Promise<void> {
  const session = await getSession();

  if (!session.accessToken || !session.refreshToken) {
    return;
  }

  if (!needsRefresh(session)) {
    return;
  }

  redirect(`/api/auth/refresh?returnTo=${encodeURIComponent(returnTo)}`);
}
