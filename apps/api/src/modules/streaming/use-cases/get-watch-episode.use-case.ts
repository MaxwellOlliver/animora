import { Injectable, NotFoundException } from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';
import { VideosRepository } from '@/modules/admin/videos/videos.repository';
import { EpisodeRatingsRepository } from '@/modules/episode-ratings/episode-ratings.repository';

@Injectable()
export class GetWatchEpisodeUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly videosRepository: VideosRepository,
    private readonly episodeRatingsRepository: EpisodeRatingsRepository,
  ) {}

  async execute(input: { episodeId: string; profileId: string }) {
    const episode = await this.episodesRepository.findByIdWithContext(
      input.episodeId,
    );
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const [video, nextEpisode, rating] = await Promise.all([
      this.videosRepository.findByOwner('episode', input.episodeId),
      this.episodesRepository.findNextByPlaylistAndNumber(
        episode.playlistId,
        episode.number,
      ),
      this.episodeRatingsRepository.getSummary(
        input.episodeId,
        input.profileId,
      ),
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
