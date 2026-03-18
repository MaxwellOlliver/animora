"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui-components/react/dialog";
import { useEffect, useState } from "react";
import {
  BookmarkIcon,
  PlayIcon,
  Volume2Icon,
  VolumeOffIcon,
  XIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/app/components/ui/button";
import { buildFetchSeriesQueryOptions } from "../../queries/fetch-series";
import { TrailerPlayer } from "../trailer-player";
import { StarRating } from "./star-rating";
import { SeriesDescription } from "./series-description";
import { EpisodesSection } from "./episodes-section";
import { TrailersSection } from "./trailers-section";
import { ReviewsSection } from "./reviews-section";

export function SeriesDetailModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const seriesId = searchParams.get("s");
  const open = !!seriesId;

  const [muted, setMuted] = useState(true);

  const { data, isLoading } = useQuery({
    ...buildFetchSeriesQueryOptions(seriesId!),
    enabled: open,
  });

  function handleClose() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("s");
    const query = params.toString();
    router.replace(query ? `?${query}` : window.location.pathname, {
      scroll: false,
    });
  }

  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    if (!open) document.body.classList.remove("overflow-hidden");
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-sm duration-200" />

        <DialogPrimitive.Popup
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8 outline-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-4xl rounded-xl bg-card shadow-2xl">
            <div className="relative">
              <div className="aspect-video w-full overflow-clip rounded-t-xl">
                <TrailerPlayer
                  src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                  poster="/images/catalog/aot-banner.jpg"
                  alt="Attack on Titan"
                  muted={muted}
                  onMutedChange={setMuted}
                />
              </div>
              <div className="pointer-events-none aspect-video absolute inset-0 rounded-t-xl bg-linear-to-t from-card from-0% via-card/80 via-35% to-transparent to-100%" />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full bg-black/60 hover:bg-black/80"
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? (
                    <VolumeOffIcon className="size-4" />
                  ) : (
                    <Volume2Icon className="size-4" />
                  )}
                </Button>
                <DialogPrimitive.Close
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full bg-black/60 hover:bg-black/80"
                    />
                  }
                >
                  <XIcon className="size-4" />
                </DialogPrimitive.Close>
              </div>
              <div className="relative z-10 -mt-64 flex flex-col gap-4 px-6 pb-6">
                <Image
                  src="/images/catalog/aot-logo.webp"
                  alt="Attack on Titan"
                  width={240}
                  height={120}
                  className="h-24 w-auto object-contain object-left drop-shadow-lg"
                  unoptimized
                />

                <StarRating rating={4.9} count="321k" />
                <div className="flex items-center gap-3">
                  <Button variant="primary" className="gap-2 px-6">
                    <PlayIcon className="size-4" />
                    Continue watching
                  </Button>
                  <Button variant="pale" size="icon-md">
                    <BookmarkIcon className="size-4" />
                  </Button>
                </div>

                <SeriesDescription
                  description="Attack on Titan is set in a world where humanity lives inside cities surrounded by enormous Walls that protect them from Titans, old creatures who devour humans seemingly without reason. Attack on Titan is set in a world where humanity lives inside cities surrounded by enormous Walls that protect them from Titans, old…"
                  studios={["Wit", "Mappa"]}
                  genres={["Action", "Drama"]}
                  contentClassification={[
                    "Drogas Lícitas",
                    "Linguagem Imprópria",
                  ]}
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 px-6 pb-6">
              <EpisodesSection />
              <TrailersSection />
              <ReviewsSection />
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
