import { buildStorageKey, type MediaPurpose } from '@animora/contracts';
import { Injectable, NotFoundException } from '@nestjs/common';

import { S3Service } from '@/infra/s3/s3.service';

import { MediaRepository } from '../media.repository';

@Injectable()
export class DeleteMediaUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string): Promise<void> {
    const media = await this.mediaRepository.findById(id);
    if (!media) throw new NotFoundException('Media not found');

    const s3Key = buildStorageKey(media.purpose as MediaPurpose, media.key);
    await this.s3Service.delete(s3Key);
    await this.mediaRepository.delete(id);
  }
}
