import { Injectable } from '@nestjs/common';
import type { VideoProcessedEvent } from '@animora/contracts';
import { VideosRepository } from '../videos.repository';

@Injectable()
export class UpdateVideoStatusUseCase {
  constructor(private readonly videosRepository: VideosRepository) {}

  async execute(event: VideoProcessedEvent): Promise<void> {
    await this.videosRepository.updateStatus(
      event.videoId,
      event.status,
      event.masterPlaylistKey,
    );
  }
}
