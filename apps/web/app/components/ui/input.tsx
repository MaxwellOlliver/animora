import { forwardRef, type ReactNode } from "react";
import { Input as BaseInput } from "@base-ui-components/react/input";

type InputProps = React.ComponentProps<typeof BaseInput> & {
  icon?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="flex h-10 items-center gap-2.5 overflow-hidden rounded-md border border-border bg-input px-2.5 transition-shadow focus-within:ring-2 focus-within:ring-primary has-aria-invalid:border-danger has-aria-invalid:focus-within:ring-1 has-aria-invalid:focus-within:ring-danger">
        {icon && (
          <span className="shrink-0 text-foreground-muted [&>svg]:size-4">
            {icon}
          </span>
        )}
        <BaseInput
          ref={ref}
          className={`w-full bg-transparent text-sm leading-5 text-foreground outline-none placeholder:text-placeholder ${className ?? ""}`}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
