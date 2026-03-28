"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui-components/react/checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "flex size-4 items-center justify-center rounded border border-border bg-input transition-colors focus-visible:ring-2 focus-visible:ring-ring aria-checked:border-primary aria-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <CheckIcon className="size-3 text-background" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
