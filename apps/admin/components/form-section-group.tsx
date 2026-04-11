import { cn } from "@/lib/utils";

import { Separator } from "./ui/separator";

interface FormSectionGroupProps {
  children: React.ReactNode;
  className?: string;
  separator?: boolean;
}

export const FormSectionGroup: React.FC<FormSectionGroupProps> = ({
  children,
  className,
  separator = true,
}: FormSectionGroupProps) => {
  return (
    <div data-slot="form-section-group" className="mt-8 first-of-type:mt-0">
      <div
        className={cn(
          "grid grid-cols-1 @3xl:grid-cols-2 gap-6 **:data-[slot='form-section']:mt-0!",
          className,
        )}
      >
        {children}
      </div>
      {separator && (
        <Separator className="hidden [[data-slot='form-section-group']:has(+[data-slot='form-section'])_&]:block [[data-slot='form-section-group']:has(+[data-slot='form-section-group'])_&]:block mt-8" />
      )}
    </div>
  );
};
