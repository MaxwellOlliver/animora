import { Injectable, NotFoundException } from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';
import { VideosRepository } from '@/modules/admin/videos/videos.repository';

@Injectable()
export class GetWatchEpisodeUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly videosRepository: VideosRepository,
  ) {}

  async execute(episodeId: string) {
    const episode =
      await this.episodesRepository.findByIdWithContext(episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const video = await this.videosRepository.findByOwner('episode', episodeId);
    const nextEpisode =
      await this.episodesRepository.findNextByPlaylistAndNumber(
        episode.playlistId,
        episode.number,
      );

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
