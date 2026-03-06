"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "../hooks";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  const errorMessage = loginMutation.error?.message ?? null;

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold text-wrap-balance">Admin Panel</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Sign in with your admin credentials
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errorMessage}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor={emailId}>Email</FieldLabel>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="admin@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loginMutation.isPending}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={passwordId}>Password</FieldLabel>
          <Input
            id={passwordId}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loginMutation.isPending}
          />
        </Field>

        <Field>
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
