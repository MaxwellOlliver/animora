import { EpisodeInfo } from "@/features/watch/components/episode-info";
import { NextEpisodeCard } from "@/features/watch/components/next-episode-card";
import { ForYouCard } from "@/features/watch/components/for-you-card";

export default function WatchRoomPage() {
  return (
    <div className="flex w-full flex-col items-center">
      {/* Video Player Placeholder */}
      <div className="aspect-video w-full max-h-[810px] bg-black" />

      {/* Content Grid */}
      <div className="grid w-full max-w-[1230px] grid-cols-12 gap-x-8 py-8">
        {/* Episode Info — left 8 columns */}
        <div className="col-span-8 flex flex-col gap-4 p-2.5">
          <EpisodeInfo />
        </div>

        {/* Sidebar — right 4 columns */}
        <div className="col-span-4 flex flex-col gap-4">
          <h3 className="font-heading text-xl font-medium leading-7">
            Next episode
          </h3>
          <NextEpisodeCard />

          <div className="h-4" />

          <h3 className="font-heading text-xl font-medium leading-7">
            For you
          </h3>
          <div className="flex flex-col gap-4">
            <ForYouCard />
            <ForYouCard />
            <ForYouCard />
          </div>
        </div>
      </div>
    </div>
  );
}
