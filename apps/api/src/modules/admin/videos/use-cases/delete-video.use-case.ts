import { Injectable, NotFoundException } from '@nestjs/common';
import { VideosRepository } from '../videos.repository';

@Injectable()
export class DeleteVideoUseCase {
  constructor(private readonly videosRepository: VideosRepository) {}

  async execute(id: string): Promise<void> {
    const video = await this.videosRepository.findById(id);
    if (!video) throw new NotFoundException('Video not found');
    await this.videosRepository.delete(id);
  }
}
