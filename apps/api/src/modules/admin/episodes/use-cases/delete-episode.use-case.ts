import { Injectable, NotFoundException } from '@nestjs/common';
import { EpisodesRepository } from '../episodes.repository';
import { S3Service } from '@/infra/s3/s3.service';

@Injectable()
export class DeleteEpisodeUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string): Promise<void> {
    const episode = await this.episodesRepository.findById(id);
    if (!episode) throw new NotFoundException('Episode not found');

    if (episode.thumbnailKey) {
      await this.s3Service.delete(episode.thumbnailKey);
    }

    await this.episodesRepository.delete(id);
  }
}
