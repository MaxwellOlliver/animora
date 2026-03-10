import { forwardRef } from "react";
import { Button as BaseButton } from "@base-ui-components/react/button";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-normal transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-foreground",
        outline: "border border-border bg-transparent text-foreground",
        ghost: "bg-transparent text-foreground",
      },
      size: {
        sm: "h-10 px-4.5 text-sm leading-5",
        lg: "h-12 px-5 text-base leading-6",
        icon: "size-10 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  },
);

type ButtonProps = React.ComponentProps<typeof BaseButton> &
  VariantProps<typeof buttonVariants>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
