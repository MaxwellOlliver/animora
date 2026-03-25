import Link from "next/link";
import { Heart, ChevronDown } from "lucide-react";

export function EpisodeInfo() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold leading-8">
        E1 - To you, 2000 years from before
      </h1>

      <div className="flex flex-col gap-4">
        <Link
          href="/series/attack-on-titan"
          className="font-heading text-base font-semibold text-primary hover:underline"
        >
          Attack on Titan
        </Link>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2.5 text-primary">
            <Heart className="size-6" />
            <span className="text-base">246</span>
          </button>
          <button className="flex items-center gap-2.5 text-foreground-muted">
            <ChevronDown className="size-6" />
            <span className="text-base">246</span>
          </button>
        </div>

        <p className="line-clamp-2 text-base leading-6 text-foreground">
          Attack on Titan is set in a world where humanity lives inside cities
          surrounded by enormous Walls that protect them from Titans, oid
          creatures who devour humans seemingly without reason.
        </p>

        <span className="text-sm leading-5 text-foreground-muted">
          Released at 01/01/2022
        </span>
      </div>
    </div>
  );
}
