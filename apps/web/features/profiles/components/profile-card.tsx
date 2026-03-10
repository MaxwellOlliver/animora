import Image from "next/image";

export function ProfileCard({
  name,
  avatar,
}: {
  name: string;
  avatar: string;
}) {
  return (
    <button className="group flex flex-col items-center gap-3">
      <div className="size-33 overflow-hidden rounded-lg transition-opacity group-hover:opacity-80">
        <Image
          src={avatar}
          alt={name}
          width={132}
          height={132}
          className="size-full object-cover"
        />
      </div>
      <span className="text-base leading-5 text-foreground-muted transition-colors group-hover:text-foreground">
        {name}
      </span>
    </button>
  );
}
