import { ConflictException, Injectable } from '@nestjs/common';

import type { CreateVideoDto } from '../dto/create-video.dto';
import type { Video } from '../video.entity';
import { VideosRepository } from '../videos.repository';

@Injectable()
export class CreateVideoUseCase {
  constructor(private readonly videosRepository: VideosRepository) {}

  async execute(dto: CreateVideoDto): Promise<Video> {
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
}
