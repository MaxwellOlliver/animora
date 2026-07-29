import { Input as BaseInput } from "@base-ui-components/react/input";
import { forwardRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<typeof BaseInput> & {
  icon?: ReactNode;
  uiSize?: "md" | "lg";
  wrapperClassName?: string;
};

const wrapperSizeClasses = {
  md: "h-10 gap-2.5 px-2.5",
  lg: "h-14 gap-3 rounded-xl border-2 px-4 shadow-lg shadow-black/10",
};

const iconSizeClasses = {
  md: "[&>svg]:size-4",
  lg: "[&>svg]:size-5",
};

const textSizeClasses = {
  md: "text-sm",
  lg: "text-base",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, wrapperClassName, icon, uiSize = "md", ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center overflow-hidden rounded-md border border-border bg-input transition-shadow focus-within:ring-2 focus-within:ring-primary has-aria-invalid:border-danger has-aria-invalid:focus-within:ring-1 has-aria-invalid:focus-within:ring-danger",
          wrapperSizeClasses[uiSize],
          wrapperClassName,
        )}
      >
        {icon && (
          <span
            className={cn(
              "shrink-0 text-foreground-muted",
              iconSizeClasses[uiSize],
            )}
          >
            {icon}
          </span>
        )}
        <BaseInput
          ref={ref}
          className={cn(
            "w-full bg-transparent leading-5 text-foreground outline-none placeholder:text-placeholder",
            textSizeClasses[uiSize],
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
