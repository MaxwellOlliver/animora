import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { ContentClassificationsRepository } from '../content-classifications.repository';
import { S3Service } from '@/infra/s3/s3.service';
import type { ContentClassification } from '../content-classification.entity';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

@Injectable()
export class UploadContentClassificationIconUseCase {
  constructor(
    private readonly repo: ContentClassificationsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string, file: MultipartFile): Promise<ContentClassification> {
    const classification = await this.repo.findById(id);
    if (!classification) throw new NotFoundException('Content classification not found');

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const buffer = await file.toBuffer();
    const ext = MIME_TO_EXT[file.mimetype];
    const newKey = await this.s3Service.upload('classification-icons', buffer, file.mimetype, ext);

    if (classification.iconKey) {
      await this.s3Service.delete(classification.iconKey);
    }

    return this.repo.update(id, { iconKey: newKey });
  }
}
