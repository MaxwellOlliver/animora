import { Injectable, NotFoundException } from '@nestjs/common';
import { VideosRepository } from '../videos.repository';
import type { Video } from '../video.entity';

@Injectable()
export class GetVideoUseCase {
  constructor(private readonly videosRepository: VideosRepository) {}

  async execute(id: string): Promise<Video> {
    const video = await this.videosRepository.findById(id);
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }
}
