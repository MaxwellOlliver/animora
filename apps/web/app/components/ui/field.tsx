import { forwardRef, type ReactNode } from "react";
import { Field as BaseField } from "@base-ui-components/react/field";
import { Input } from "./input";

type FieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  label: string;
  icon?: ReactNode;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, icon, ...props }, ref) => {
    return (
      <BaseField.Root className="flex flex-col gap-1">
        <BaseField.Label className="text-sm leading-5 text-foreground-muted">
          {label}
        </BaseField.Label>
        <Input ref={ref} icon={icon} {...props} />
      </BaseField.Root>
    );
  },
);

Field.displayName = "Field";

export { Field };
