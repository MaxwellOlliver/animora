import { Injectable } from '@nestjs/common';

import { CreateVideoUseCase } from '../../videos/use-cases/create-video.use-case';
import type { VideoOwnerType } from '../../videos/video.entity';
import type { InitUploadDto } from '../dto/init-upload.dto';
import { UploadsRepository } from '../repositories/uploads.repository';

export const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
const UPLOAD_TTL_HOURS = 24;

export interface InitUploadResult {
  uploadId: string;
  chunkSize: number;
}

@Injectable()
export class InitUploadUseCase {
  constructor(
    private readonly createVideoUseCase: CreateVideoUseCase,
    private readonly uploadsRepository: UploadsRepository,
  ) {}

  async execute(
    ownerType: VideoOwnerType,
    ownerId: string,
    dto: InitUploadDto,
  ): Promise<InitUploadResult> {
    const video = await this.createVideoUseCase.execute({ ownerType, ownerId });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + UPLOAD_TTL_HOURS);

    const upload = await this.uploadsRepository.create({
      videoId: video.id,
      totalChunks: dto.totalChunks,
      expiresAt,
    });

    return { uploadId: upload.id, chunkSize: CHUNK_SIZE };
  }
}
