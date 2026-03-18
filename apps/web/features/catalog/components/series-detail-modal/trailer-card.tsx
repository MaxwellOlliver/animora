import Image from "next/image";

interface TrailerCardProps {
  title: string;
  thumbnail: string;
  duration: string;
}

export function TrailerCard({ title, thumbnail, duration }: TrailerCardProps) {
  return (
    <div className="relative flex w-40 shrink-0 flex-col gap-2 py-2 after:pointer-events-none after:absolute after:inset-y-0 after:-inset-x-2 after:rounded-lg after:bg-elevated after:opacity-0 after:transition-opacity hover:after:opacity-100">
      <div className="relative z-10 aspect-video w-full overflow-clip rounded-md">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
          unoptimized
        />
        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium">
          {duration}
        </span>
      </div>
      <span className="relative z-10 text-sm">{title}</span>
    </div>
  );
}
