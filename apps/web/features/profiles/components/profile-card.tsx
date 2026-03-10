import Image from "next/image";
import Link from "next/link";
import { Pen } from "lucide-react";

function ProfileCardContent({
  name,
  avatar,
  editing,
}: {
  name: string;
  avatar: string;
  editing?: boolean;
}) {
  return (
    <>
      <div className="relative size-33 overflow-hidden rounded-lg">
        <Image
          src={avatar}
          alt={name}
          width={132}
          height={132}
          className="size-full object-cover transition-opacity group-hover:opacity-80"
        />
        {editing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Pen className="size-8 text-foreground" />
          </div>
        )}
      </div>
      <span className="text-base leading-5 text-foreground-muted transition-colors group-hover:text-foreground">
        {name}
      </span>
    </>
  );
}

export function ProfileCard({
  id,
  name,
  avatar,
  editing,
}: {
  id: string;
  name: string;
  avatar: string;
  editing?: boolean;
}) {
  const className =
    "group flex flex-col items-center gap-3 hover:scale-105 transition-transform";

  if (editing) {
    return (
      <Link href={`/profile-edit/${id}`} className={className}>
        <ProfileCardContent name={name} avatar={avatar} editing />
      </Link>
    );
  }

  return (
    <button className={className}>
      <ProfileCardContent name={name} avatar={avatar} />
    </button>
  );
}
