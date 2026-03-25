import Image from "next/image";
import { cn } from "@/lib/utils";

interface EpisodeThumbnailProps {
  src: string;
  alt: string;
  duration?: string;
  progress?: number;
  className?: string;
}

export function EpisodeThumbnail({
  src,
  alt,
  duration,
  progress,
  className,
}: EpisodeThumbnailProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg",
        className,
      )}
    >
      <div className="relative aspect-video size-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          unoptimized
        />
        {duration && (
          <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium">
            {duration}
          </span>
        )}
      </div>
      {progress != null && (
        <div
          className="absolute bottom-0 left-0 h-1 rounded-full bg-secondary"
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}
