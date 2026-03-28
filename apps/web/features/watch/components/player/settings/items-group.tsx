import { cn } from "@/lib/utils";

interface SettingsItemsGroup {
  children: React.ReactNode;
  className?: string;
}

export function SettingsItemsGroup({
  children,
  className,
}: SettingsItemsGroup) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>{children}</div>
  );
}
