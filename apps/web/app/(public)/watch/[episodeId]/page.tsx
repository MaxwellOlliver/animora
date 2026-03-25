import { EpisodeInfo } from "@/features/watch/components/episode-info";
import { CommentsSection } from "@/features/watch/components/comments-section";
import { SidebarEpisodeCard } from "@/features/watch/components/sidebar-episode-card";

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
          <div className="h-4" />
          <CommentsSection />
        </div>

        {/* Sidebar — right 4 columns */}
        <div className="col-span-4 flex flex-col gap-4">
          <h3 className="font-heading text-xl font-medium leading-7">
            Next episode
          </h3>
          <SidebarEpisodeCard />

          <div className="h-4" />

          <h3 className="font-heading text-xl font-medium leading-7">
            For you
          </h3>
          <div className="flex flex-col gap-4">
            <SidebarEpisodeCard progress={75} />
            <SidebarEpisodeCard progress={75} />
            <SidebarEpisodeCard progress={75} />
          </div>
        </div>
      </div>
    </div>
  );
}
