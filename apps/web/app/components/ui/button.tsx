import { forwardRef } from "react";
import { Button as BaseButton } from "@base-ui-components/react/button";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "outline-none text-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:size-4 [&_svg]:shrink-0 inline-flex items-center justify-center gap-2 rounded-md font-normal bg-clip-padding transition-[background-color,opacity] hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-foreground",
        outline:
          "border border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-background-muted",
        ghost: "bg-transparent text-foreground hover:bg-foreground/10",
        pale: "bg-foreground/5 text-foreground hover:bg-foreground/10",
      },
      size: {
        sm: "h-10 px-4.5 text-sm leading-5",
        lg: "h-12 px-5 text-base leading-6 [&_svg]:size-5",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-md": "size-10 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
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
