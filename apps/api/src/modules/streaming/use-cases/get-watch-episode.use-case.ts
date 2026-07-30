import { Injectable, NotFoundException } from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';
import { VideosRepository } from '@/modules/admin/videos/videos.repository';
import { EpisodeRatingsRepository } from '@/modules/episode-ratings/episode-ratings.repository';
import { EpisodeTimestampsRepository } from '@/modules/episode-timestamps/episode-timestamps.repository';

@Injectable()
export class GetWatchEpisodeUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly videosRepository: VideosRepository,
    private readonly episodeRatingsRepository: EpisodeRatingsRepository,
    private readonly episodeTimestampsRepository: EpisodeTimestampsRepository,
  ) {}

  async execute(input: { episodeId: string; profileId: string }) {
    const episode = await this.episodesRepository.findByIdWithContext(
      input.episodeId,
      true,
    );
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const [video, nextEpisode, rating, timestamps] = await Promise.all([
      this.videosRepository.findByOwner('episode', input.episodeId),
      this.episodesRepository.findNextByPlaylistAndNumber(
        episode.playlistId,
        episode.number,
      ),
      this.episodeRatingsRepository.getSummary(
        input.episodeId,
        input.profileId,
      ),
      this.episodeTimestampsRepository.findByEpisodeId(input.episodeId),
    ]);

    return {
      episode: {
        id: episode.id,
        playlistId: episode.playlistId,
        number: episode.number,
        title: episode.title,
        description: episode.description,
        thumbnailId: episode.thumbnailId,
        durationSeconds: episode.durationSeconds,
        createdAt: episode.createdAt,
        updatedAt: episode.updatedAt,
        playlist: episode.playlist,
        series: episode.series,
      },
      thumbnail: episode.thumbnail,
      video,
      rating: {
        likes: rating.likes,
        dislikes: rating.dislikes,
        myRating: rating.myRating,
        liked: rating.myRating === 'like',
      },
      timestamps: timestamps.map((t) => ({
        type: t.type,
        startSeconds: t.startSeconds,
        endSeconds: t.endSeconds,
      })),
      nextEpisode: nextEpisode
        ? {
            id: nextEpisode.id,
            playlistId: nextEpisode.playlistId,
            number: nextEpisode.number,
            title: nextEpisode.title,
            description: nextEpisode.description,
            thumbnailId: nextEpisode.thumbnailId,
            durationSeconds: nextEpisode.durationSeconds,
            createdAt: nextEpisode.createdAt,
            updatedAt: nextEpisode.updatedAt,
            thumbnail: nextEpisode.thumbnail,
          }
        : null,
    };
  }
}
