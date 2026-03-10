"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight, ImageOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { signInSchema, type SignInForm } from "@/features/auth/schemas/sign-in";

export default function SignInPage() {
  const { register, handleSubmit } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  function onSubmit(data: SignInForm) {
    console.log(data);
  }

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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              type="email"
              placeholder="mail@mail.com"
              icon={<Mail />}
              {...register("email")}
            />

            <Input
              type="password"
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              icon={<Lock />}
              {...register("password")}
            />

            <Button type="submit" className="mt-6">
              sign in
              <ArrowRight />
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
            <button
              type="button"
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
            </button>
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
