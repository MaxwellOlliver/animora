"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Select,
  SelectTrigger,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { buildMediaUrl } from "@/utils/media-utils";
import { buildFetchPlaylistEpisodesQueryOptions } from "../../queries/fetch-playlist-episodes";
import type { PlaylistSummary } from "../../queries/fetch-series-playlists";
import { EpisodeRow } from "./episode-row";

type SelectOption = { label: string; value: string };

function playlistLabel(playlist: PlaylistSummary): string {
  if (playlist.title) return playlist.title;
  if (playlist.type === "season") return `Season ${playlist.number}`;
  if (playlist.type === "movie") return `Movie ${playlist.number}`;
  return `Special ${playlist.number}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

interface EpisodesSectionProps {
  playlists: PlaylistSummary[];
}

export function EpisodesSection({ playlists }: EpisodesSectionProps) {
  const items = useMemo(
    () =>
      playlists.map((p) => ({
        label: playlistLabel(p),
        value: p.id,
      })),
    [playlists],
  );

  const [selected, setSelected] = useState<SelectOption | null>(null);
  const activeItem = selected ?? items[0];

  const { data: episodes } = useQuery({
    ...buildFetchPlaylistEpisodesQueryOptions(activeItem?.value ?? ""),
    enabled: !!activeItem,
  });

  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold">Episodes</h3>
        <Select
          value={activeItem}
          onValueChange={setSelected}
          items={items}
        >
          <SelectTrigger />
          <SelectPopup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        {episodes?.map((episode) => (
          <EpisodeRow
            key={episode.id}
            number={episode.number}
            title={episode.title}
            description={episode.description ?? ""}
            thumbnail={
              episode.thumbnail
                ? buildMediaUrl(
                    episode.thumbnail.purpose,
                    episode.thumbnail.key,
                  )
                : "/images/episode-thumbnail.png"
            }
            duration={
              episode.durationSeconds
                ? formatDuration(episode.durationSeconds)
                : ""
            }
          />
        ))}
      </div>
    </section>
  );
}
