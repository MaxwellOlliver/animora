import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EpisodesRepository } from '../../episodes/episodes.repository';
import { TrailersRepository } from '../../trailers/trailers.repository';
import type { CreateVideoDto } from '../dto/create-video.dto';
import type { Video } from '../video.entity';
import { VideosRepository } from '../videos.repository';

@Injectable()
export class CreateVideoUseCase {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly episodesRepository: EpisodesRepository,
    private readonly trailersRepository: TrailersRepository,
  ) {}

  async execute(dto: CreateVideoDto): Promise<Video> {
    await this.validateOwnerExists(dto.ownerType, dto.ownerId);

    const existing = await this.videosRepository.findByOwner(
      dto.ownerType,
      dto.ownerId,
    );
    if (existing) {
      throw new ConflictException(
        `A video already exists for this ${dto.ownerType}`,
      );
    }

    return this.videosRepository.create({
      ownerType: dto.ownerType,
      ownerId: dto.ownerId,
    });
  }

  private async validateOwnerExists(
    ownerType: string,
    ownerId: string,
  ): Promise<void> {
    switch (ownerType) {
      case 'episode': {
        const episode = await this.episodesRepository.findById(ownerId);
        if (!episode) throw new NotFoundException('Episode not found');
        break;
      }
      case 'trailer': {
        const trailer = await this.trailersRepository.findById(ownerId);
        if (!trailer) throw new NotFoundException('Trailer not found');
        break;
      }
    }
  }
}
