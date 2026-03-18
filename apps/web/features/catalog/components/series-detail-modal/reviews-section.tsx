import { PlusIcon } from "lucide-react";
import { ReviewCard } from "./review-card";

export function ReviewsSection() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold">Reviews</h3>
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-secondary hover:underline"
        >
          <PlusIcon className="size-4" />
          add review
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <ReviewCard
          name="Profile Name"
          avatar="/images/avatar-placeholder.svg"
          rating={4.9}
          text="Attack on Titan is set in a world where humanity lives inside cities surrounded by enormous Walls that protect them from Titans, old creatures who devour humans seemingly without reason."
          likes={246}
          liked
        />
        <ReviewCard
          name="Profile Name"
          avatar="/images/avatar-placeholder.svg"
          rating={4.9}
          text="Attack on Titan is set in a world where humanity lives inside cities surrounded by enormous Walls that protect them from Titans, old creatures who devour humans seemingly without reason."
          likes={246}
        />
      </div>
    </section>
  );
}
