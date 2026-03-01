import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { SeriesRepository } from '../series.repository';
import { S3Service } from '@/infra/s3/s3.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class UploadSeriesBannerUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(seriesId: string, file: MultipartFile): Promise<void> {
    const s = await this.seriesRepository.findById(seriesId);
    if (!s) throw new NotFoundException('Series not found');

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const buffer = await file.toBuffer();
    const ext = MIME_TO_EXT[file.mimetype];
    const newKey = await this.s3Service.upload(
      'banners',
      buffer,
      file.mimetype,
      ext,
    );

    if (s.bannerKey) {
      await this.s3Service.delete(s.bannerKey);
    }

    await this.seriesRepository.update(seriesId, { bannerKey: newKey });
  }
}
