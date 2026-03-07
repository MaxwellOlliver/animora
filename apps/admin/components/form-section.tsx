import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Separator } from "./ui/separator";

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  contents?: boolean;
  separator?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  icon: Icon,
  className,
  contents = false,
  separator = true,
}: FormSectionProps) => {
  return (
    <div
      data-slot="form-section"
      className={cn(
        "flex flex-col mb-0 not-first:mt-8 w-full gap-4! group/form-section",
        className,
      )}
    >
      {!contents && (
        <div className="flex items-center gap-4">
          <h6 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 md:text-nowrap">
            {Icon && <Icon className="size-5 text-primary" />}
            <span>{title}</span>
          </h6>
        </div>
      )}
      <div>{children}</div>

      {separator && (
        <Separator className="hidden [[data-slot='form-section']:has(+[data-slot='form-section'])_&]:block [[data-slot='form-section']:has(+[data-slot='form-section-group'])_&]:block mt-4" />
      )}
    </div>
  );
};
