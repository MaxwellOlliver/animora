import { TrailerCard } from "./trailer-card";

export function TrailersSection() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-heading text-lg font-semibold">Trailers</h3>
      <div className="flex gap-4">
        <TrailerCard
          title="That day"
          thumbnail="/images/episode-thumbnail.png"
          duration="24m 32s"
        />
        <TrailerCard
          title="To you, 2000 years from now"
          thumbnail="/images/episode-thumbnail.png"
          duration="24m 32s"
        />
      </div>
    </section>
  );
}
