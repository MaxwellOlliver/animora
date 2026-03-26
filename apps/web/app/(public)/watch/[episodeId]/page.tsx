import { EpisodeInfo } from "@/features/watch/components/episode-info";
import { CommentsSection } from "@/features/watch/components/comments-section";
import { SidebarEpisodeCard } from "@/features/watch/components/sidebar-episode-card";
import { WatchPartyChat } from "@/features/watch/components/watch-party-chat";
import { VideoPlayer } from "@/features/watch/components/player/video-player";

const MOCK_TIMESTAMP_ACTIONS = [
  { label: "skip opening", startTime: 30, endTime: 120, skipTo: 120 },
  { label: "skip ending", startTime: 1350, endTime: 1440, skipTo: 1440 },
];

export default function WatchRoomPage() {
  return (
    <div className="flex w-full flex-col items-center">
      <VideoPlayer
        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        title="Attack on Titan - Episode 1"
        timestampActions={MOCK_TIMESTAMP_ACTIONS}
        overlayMessages={[
          {
            id: "1",
            text: "Hey guys!",
            user: "Max",
            avatar: "/",
          },
        ]}
      />
      <div className="grid w-full max-w-307.5 grid-cols-12 gap-x-8 py-8">
        <div className="col-span-8 flex flex-col gap-4 p-2.5">
          <EpisodeInfo />
          <div className="h-4" />
          <CommentsSection />
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          <WatchPartyChat />
          <div className="h-4" />
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
