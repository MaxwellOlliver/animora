import { Injectable, NotFoundException } from '@nestjs/common';

import type { Video } from '../video.entity';
import { VideosRepository } from '../videos.repository';

@Injectable()
export class GetVideoUseCase {
  constructor(private readonly videosRepository: VideosRepository) {}

  async execute(id: string): Promise<Video> {
    const video = await this.videosRepository.findById(id);
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }
}
