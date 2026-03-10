"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, User, Mail, Lock, LockKeyhole } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Field } from "@/app/components/ui/field";
import { signUpSchema, type SignUpForm } from "@/features/auth/schemas/sign-up";

export default function SignUpPage() {
  const { register, handleSubmit } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  function onSubmit(data: SignUpForm) {
    console.log(data);
  }

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-background p-6">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute -left-48 -top-48 size-156 rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 top-1/3 size-116 rounded-full bg-primary/6 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/3 size-75 rounded-full bg-secondary/3 blur-[80px]" />

      {/* Main content */}
      <div className="relative w-full max-w-md p-8">
        <div className="flex flex-col items-center">
          <Image
            src="/images/logo.svg"
            alt="Animora"
            width={164}
            height={37}
            priority
            className="mb-8"
          />

          <h1 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            Sign Up
          </h1>
          <p className="text-base leading-6 text-foreground-muted">
            Create an account
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-4"
        >
          <Field
            label="Name"
            type="text"
            placeholder="Your name"
            icon={<User />}
            {...register("name")}
          />

          <Field
            label="Email"
            type="email"
            placeholder="mail@mail.com"
            icon={<Mail />}
            {...register("email")}
          />

          <Field
            label="Password"
            type="password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            icon={<Lock />}
            {...register("password")}
          />

          <Field
            label="Confirm Password"
            type="password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            icon={<LockKeyhole />}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="mt-6">
            sign up
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

        {/* Google sign up */}
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
              Register with Google
            </span>
          </button>
        </div>

        <p className="mt-8 text-center text-xs leading-4 text-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
