"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setTokens } from "@/lib/session";
import { signInSchema } from "@/features/auth/schemas/sign-in";
import type { ActionResult } from "@/lib/action";

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

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
    const { accessToken, refreshToken } = await api<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: parsed.data,
        auth: false,
      },
    );

    await setTokens(accessToken, refreshToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { error: "Invalid email or password" };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/profile-selection?from=auth");
}
