import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { VideosRepository } from '../videos.repository';
import { EpisodesRepository } from '../../episodes/episodes.repository';
import type { CreateVideoDto } from '../dto/create-video.dto';
import type { Video } from '../video.entity';

@Injectable()
export class CreateVideoUseCase {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

  async execute(dto: CreateVideoDto): Promise<Video> {
    const episode = await this.episodesRepository.findById(dto.episodeId);
    if (!episode) throw new NotFoundException('Episode not found');

    const existing = await this.videosRepository.findByEpisodeId(dto.episodeId);
    if (existing) {
      throw new ConflictException('A video already exists for this episode');
    }

    return this.videosRepository.create({ episodeId: dto.episodeId });
  }
}
