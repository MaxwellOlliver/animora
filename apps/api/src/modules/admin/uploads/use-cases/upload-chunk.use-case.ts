import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { S3Service } from '@/infra/s3/s3.service';
import { UploadsRepository } from '../uploads.repository';

@Injectable()
export class UploadChunkUseCase {
  constructor(
    private readonly uploadsRepository: UploadsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(
    uploadId: string,
    index: number,
    file: MultipartFile,
  ): Promise<{ index: number; received: boolean }> {
    const upload = await this.uploadsRepository.findById(uploadId);
    if (!upload) throw new NotFoundException('Upload not found');

    if (upload.expiresAt < new Date()) {
      file.file.resume(); // drain unconsumed stream
      throw new GoneException('Upload session has expired');
    }

    if (index < 0 || index >= upload.totalChunks) {
      file.file.resume();
      throw new BadRequestException(
        `Chunk index must be between 0 and ${upload.totalChunks - 1}`,
      );
    }

    const key = `temp/${uploadId}/chunk-${index}`;
    await this.s3Service.putStream(key, file.file);

    const isNew = await this.uploadsRepository.markChunkReceived(
      uploadId,
      index,
    );
    if (isNew) {
      await this.uploadsRepository.incrementReceivedChunks(uploadId);
    }

    return { index, received: true };
  }
}
