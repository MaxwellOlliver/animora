"use client";

import { Switch as SwitchPrimitive } from "@base-ui-components/react/switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border bg-input p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring data-checked:border-primary data-checked:bg-primary data-invalid:ring-2 data-invalid:ring-danger disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="size-4 rounded-full bg-foreground transition-transform data-checked:translate-x-4" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
