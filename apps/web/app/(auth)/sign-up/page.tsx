import { redirect } from "next/navigation";

import { env } from "@/lib/env";

import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  if (env.NEXT_PUBLIC_SIGNUP_ENABLED === "false") {
    redirect("/sign-in");
  }
  return <SignUpForm />;
}
