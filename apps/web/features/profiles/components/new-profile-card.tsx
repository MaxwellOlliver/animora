import Image from "next/image";
import Link from "next/link";

export function NewProfileCard() {
  return (
    <Link
      href="/profile-create"
      className="group flex flex-col items-center gap-3"
      aria-label="Add new profile"
    >
      <div className="flex size-33 items-center justify-center rounded-lg group-hover:bg-foreground/5 transition-colors">
        <Image
          src="/images/add-profile.svg"
          alt="Add profile"
          width={64}
          height={50}
          className="transition-opacity opacity-80 group-hover:opacity-100"
        />
      </div>
      <span className="text-base leading-5 text-foreground-muted transition-colors group-hover:text-foreground">
        new profile
      </span>
    </Link>
  );
}
