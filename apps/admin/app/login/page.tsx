import { LoginForm } from "@/features/auth/components/login-form";
import LogoFull from "@/public/logo-full.svg";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <LogoFull className="w-40" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-4xl font-bold text-muted-foreground/20">
            Animora Admin
          </p>
        </div>
      </div>
    </div>
  );
}
