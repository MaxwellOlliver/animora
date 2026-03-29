import { Injectable, NotFoundException } from '@nestjs/common';

import type { Video, VideoOwnerType } from '../video.entity';
import { VideosRepository } from '../videos.repository';

@Injectable()
export class GetVideoByOwnerUseCase {
  constructor(private readonly videosRepository: VideosRepository) {}

  async execute(ownerType: VideoOwnerType, ownerId: string): Promise<Video> {
    const video = await this.videosRepository.findByOwner(ownerType, ownerId);
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }
}
