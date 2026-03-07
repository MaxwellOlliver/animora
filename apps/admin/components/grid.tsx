import { cn } from "@/lib/utils";

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

export const Grid = ({ children, className }: GridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 @2xl/layout-main:grid-cols-2 @5xl/layout-main:grid-cols-3 gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
};
