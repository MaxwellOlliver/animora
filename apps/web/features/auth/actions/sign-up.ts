"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setTokens } from "@/lib/session";
import { signUpSchema } from "@/features/auth/schemas/sign-up";
import type { ActionResult } from "@/lib/action";

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function signUp(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { confirmPassword: _, ...body } = parsed.data;

  try {
    const { accessToken, refreshToken } = await api<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body,
        auth: false,
      },
    );

    await setTokens(accessToken, refreshToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      return { error: "An account with this email already exists" };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/profile-selection?from=auth");
}
