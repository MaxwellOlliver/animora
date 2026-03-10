import { forwardRef } from "react";
import { Avatar as BaseAvatar } from "@base-ui-components/react/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string;
  alt?: string;
  className?: string;
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = "Avatar", className }, ref) => {
    return (
      <BaseAvatar.Root
        ref={ref}
        className={cn(
          "flex size-8 items-center justify-center overflow-hidden rounded-full bg-elevated",
          className,
        )}
      >
        <BaseAvatar.Image
          src={src}
          alt={alt}
          className="size-full object-cover"
        />
        <BaseAvatar.Fallback className="flex size-full items-center justify-center text-foreground-muted">
          <User className="size-4" />
        </BaseAvatar.Fallback>
      </BaseAvatar.Root>
    );
  },
);

Avatar.displayName = "Avatar";

export { Avatar };
