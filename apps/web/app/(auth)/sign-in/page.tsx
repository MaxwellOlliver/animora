"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ImageOff, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { signIn } from "@/features/auth/actions/sign-in";
import type { ActionResult } from "@/lib/action";
import { env } from "@/lib/env";

export default function SignInPage() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    signIn,
    {},
  );

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-background p-6">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute -right-32 -top-32 size-175 rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 size-125 rounded-full bg-primary/6 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 size-75 rounded-full bg-secondary/3 blur-[80px]" />

      {/* Main content */}
      <div className="relative flex w-full max-w-3xl overflow-hidden rounded-lg">
        {/* Form side */}
        <div className="flex w-1/2 flex-col p-8">
          <Image
            src="/images/logo.svg"
            alt="Animora"
            width={164}
            height={37}
            priority
            className="mb-8"
          />

          <h1 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            Sign In
          </h1>
          <p className="mb-6 text-base leading-6 text-foreground-muted">
            Log in to your account
          </p>

          <form action={action} className="flex flex-col gap-4">
            <Input
              type="email"
              name="email"
              placeholder="mail@mail.com"
              icon={<Mail />}
              required
            />

            <Input
              type="password"
              name="password"
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              icon={<Lock />}
              required
            />

            {state.error && (
              <p role="alert" className="text-xs text-danger">
                {state.error}
              </p>
            )}

            <Button type="submit" className="mt-6" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : "sign in"}
              {!pending && <ArrowRight />}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-6">
            <div className="h-px w-full bg-border" />
            <span className="absolute bg-background px-1 text-[10px] leading-3.5 text-foreground-muted">
              or
            </span>
          </div>

          {/* Google sign in */}
          <div className="flex justify-center">
            <a
              href={`${env.NEXT_PUBLIC_API_URL}/auth/google`}
              className="flex h-10 items-center gap-2 rounded-md border border-[#3a3a3a] bg-[#131314] px-3 py-2 transition-opacity hover:opacity-90"
            >
              <Image
                src="/images/google-icon.svg"
                alt="Google"
                width={18}
                height={18}
              />
              <span className="text-sm font-semibold leading-5 text-[#e3e3e3]">
                Sign in with Google
              </span>
            </a>
          </div>

          <p className="mt-8 text-center text-xs leading-4 text-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Image side */}
        <div className="flex w-1/2 items-center justify-center">
          <div className="flex h-full w-full items-center justify-center rounded-md bg-placeholder/19">
            <ImageOff className="size-6 text-foreground-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
