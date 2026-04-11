import { notFound, redirect } from "next/navigation";

import { fetchProfile } from "@/features/profiles/queries/fetch-profiles";
import { CommentsSection } from "@/features/watch/components/comments-section";
import { EpisodeInfo } from "@/features/watch/components/episode-info";
import { SidebarEpisodeCard } from "@/features/watch/components/sidebar-episode-card";
import { WatchPartyChat } from "@/features/watch/components/watch-party-chat";
import { WatchVideoPlayer } from "@/features/watch/components/watch-video-player";
import { fetchWatchEpisode } from "@/features/watch/queries/fetch-watch-episode";
import { ApiError, SessionExpiredError } from "@/lib/api";
import { ensureFreshSession } from "@/lib/ensure-fresh-session";
import { getSession } from "@/lib/session";
import { buildHlsUrl, buildMediaUrl } from "@/utils/media-utils";

const MOCK_TIMESTAMP_ACTIONS = [
  { label: "skip opening", startTime: 30, endTime: 120, skipTo: 120 },
  { label: "skip ending", startTime: 1350, endTime: 1440, skipTo: 1440 },
];

type WatchRoomPageProps = {
  params: Promise<{ episodeId: string }>;
};

async function getWatchRoomPayload(episodeId: string) {
  try {
    return await fetchWatchEpisode(episodeId);
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      redirect("/sign-in?error=session_expired");
    }

    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

function formatReleaseDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
}

export default async function WatchRoomPage({ params }: WatchRoomPageProps) {
  const { episodeId } = await params;
  await ensureFreshSession(`/watch/${episodeId}`);
  const [payload, session] = await Promise.all([
    getWatchRoomPayload(episodeId),
    getSession(),
  ]);
  const profile = session.profileId
    ? await fetchProfile(session.profileId).catch(() => null)
    : null;
  const currentProfileAvatar = profile?.avatar?.picture ?? null;

  if (
    !payload.video ||
    payload.video.status !== "ready" ||
    !payload.video.masterPlaylistKey
  ) {
    notFound();
  }

  const playerTitle = `${payload.episode.series.name} - E${payload.episode.number} - ${payload.episode.title}`;

  return (
    <div className="flex w-full flex-col items-center">
      <WatchVideoPlayer
        episodeId={episodeId}
        src={buildHlsUrl(payload.video.masterPlaylistKey)}
        title={playerTitle}
        nextEpisodeId={payload.nextEpisode?.id}
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
      <div className="grid w-full max-w-350 grid-cols-12 gap-x-8 py-8">
        <div className="col-span-8 flex flex-col gap-4 p-2.5">
          <EpisodeInfo
            episodeId={episodeId}
            episodeNumber={payload.episode.number}
            title={payload.episode.title}
            seriesId={payload.episode.series.id}
            seriesName={payload.episode.series.name}
            description={payload.episode.description}
            releasedAt={formatReleaseDate(payload.episode.createdAt)}
            likes={payload.rating.likes}
            dislikes={payload.rating.dislikes}
            myRating={payload.rating.myRating}
          />
          <div className="h-4" />
          <CommentsSection
            episodeId={episodeId}
            currentProfileAvatar={currentProfileAvatar}
          />
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          <WatchPartyChat />
          {payload.nextEpisode && (
            <>
              <div className="h-4" />
              <h3 className="font-heading text-xl font-medium leading-7">
                Next episode
              </h3>
              <SidebarEpisodeCard
                href={`/watch/${payload.nextEpisode.id}`}
                seriesName={payload.episode.series.name}
                episodeNumber={payload.nextEpisode.number}
                title={payload.nextEpisode.title}
                thumbnailSrc={
                  payload.nextEpisode.thumbnail
                    ? buildMediaUrl(
                        payload.nextEpisode.thumbnail.purpose,
                        payload.nextEpisode.thumbnail.key,
                      )
                    : "/images/episode-thumbnail.png"
                }
                thumbnailAlt={payload.nextEpisode.title}
                duration={
                  payload.nextEpisode.durationSeconds
                    ? formatDuration(payload.nextEpisode.durationSeconds)
                    : undefined
                }
              />
            </>
          )}
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
