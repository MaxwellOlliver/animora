import {
  Select,
  SelectTrigger,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { EpisodeRow } from "./episode-row";

const SEASONS = [
  { label: "Season 1", value: "1" },
  { label: "Season 2", value: "2" },
  { label: "Season 3", value: "3" },
  { label: "Season 4", value: "4" },
];

export function EpisodesSection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold">Episodes</h3>
        <Select defaultValue={SEASONS[0]} items={SEASONS}>
          <SelectTrigger />
          <SelectPopup>
            {SEASONS.map((item) => (
              <SelectItem key={item.value} value={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <EpisodeRow
          number={1}
          title="To you, 2000 years from now"
          description="Attack on Titan is set in a world where humanity lives inside cities surrounded by enormous Walls that protect them from Titans, old creatures who devour humans…"
          thumbnail="/images/episode-thumbnail.png"
          duration="24m 32s"
        />
        <EpisodeRow
          number={2}
          title="That day"
          description="Attack on Titan is set in a world where humanity lives inside cities surrounded by enormous Walls that protect them from Titans, old creatures who devour humans…"
          thumbnail="/images/episode-thumbnail.png"
          duration="24m 32s"
        />
      </div>
    </section>
  );
}
