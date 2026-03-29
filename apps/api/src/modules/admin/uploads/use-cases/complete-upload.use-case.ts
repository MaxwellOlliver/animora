import { EVENTS, VideoUploadedEvent } from '@animora/contracts';
import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RabbitMQService } from '@/infra/rabbitmq/rabbitmq.service';
import { S3Service } from '@/infra/s3/s3.service';

import { VideoEventsService } from '../../videos/video-events.service';
import { VideosRepository } from '../../videos/videos.repository';
import { UploadsRepository } from '../repositories/uploads.repository';

@Injectable()
export class CompleteUploadUseCase {
  constructor(
    private readonly uploadsRepository: UploadsRepository,
    private readonly videosRepository: VideosRepository,
    private readonly videoEventsService: VideoEventsService,
    private readonly s3Service: S3Service,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async execute(
    uploadId: string,
  ): Promise<{ videoId: string; status: string }> {
    const upload = await this.uploadsRepository.findById(uploadId);
    if (!upload) throw new NotFoundException('Upload not found');

    if (upload.expiresAt < new Date()) {
      throw new GoneException('Upload session has expired');
    }

    if (upload.receivedChunks < upload.totalChunks) {
      throw new BadRequestException(
        `Upload incomplete: ${upload.receivedChunks}/${upload.totalChunks} chunks received`,
      );
    }

    const video = await this.videosRepository.findById(upload.videoId);
    if (!video) throw new NotFoundException('Video not found');

    const sourceKeys = Array.from(
      { length: upload.totalChunks },
      (_, i) => `temp/${uploadId}/chunk-${i}`,
    );
    const rawObjectKey = `raw/${upload.videoId}/original.mp4`;

    await this.s3Service.composeObjects(sourceKeys, rawObjectKey);
    await this.s3Service.deleteMany(sourceKeys);

    await this.videosRepository.update(upload.videoId, {
      status: 'processing',
      rawObjectKey,
    });

    await this.rabbitMQService.emit<VideoUploadedEvent>(EVENTS.VIDEO_UPLOADED, {
      videoId: upload.videoId,
      ownerType: video.ownerType,
      ownerId: video.ownerId,
      rawObjectKey,
      qualities: ['360p', '720p', '1080p'],
    });

    this.videoEventsService.emit(upload.videoId, 'processing');

    return { videoId: upload.videoId, status: 'processing' };
  }
}
