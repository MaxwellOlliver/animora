"use server";

import { redirect } from "next/navigation";
import { signInSchema } from "@/features/auth/schemas/sign-in";
import type { ActionResult } from "@/lib/action";
import { getSession, decodeTokenExpiry } from "@/lib/session";
import { apiInternal, ApiError } from "@/lib/api-internal";

type AuthResponse = { accessToken: string; refreshToken: string };

export async function signIn(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const data = await apiInternal<AuthResponse>("/auth/login", {
      method: "POST",
      body: parsed.data,
    });

    const session = await getSession();
    session.accessToken = data.accessToken;
    session.refreshToken = data.refreshToken;
    session.expiresAt = decodeTokenExpiry(data.accessToken);
    await session.save();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { error: "Invalid email or password" };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/profile-selection?from=auth");
}
