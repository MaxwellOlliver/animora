import { buildStorageKey, type MediaPurpose } from '@animora/contracts';
import type { MultipartFile } from '@fastify/multipart';
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { S3Service } from '@/infra/s3/s3.service';

import type { Media } from '../media.entity';
import { MediaRepository } from '../media.repository';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class UploadMediaUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(file: MultipartFile, purpose: MediaPurpose): Promise<Media> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    const ext = MIME_TO_EXT[file.mimetype];
    const filename = `${randomUUID()}.${ext}`;
    const s3Key = buildStorageKey(purpose, filename);

    const buffer = await file.toBuffer();
    await this.s3Service.putObject(s3Key, buffer, file.mimetype);

    return this.mediaRepository.create({
      key: filename,
      purpose,
      mimeType: file.mimetype,
    });
  }
}
