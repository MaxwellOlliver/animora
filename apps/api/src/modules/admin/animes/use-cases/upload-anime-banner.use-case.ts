import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { AnimesRepository } from '../animes.repository';
import { S3Service } from '@/infra/s3/s3.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class UploadAnimeBannerUseCase {
  constructor(
    private readonly animesRepository: AnimesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(animeId: string, file: MultipartFile): Promise<void> {
    const anime = await this.animesRepository.findById(animeId);
    if (!anime) throw new NotFoundException('Anime not found');

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

    if (anime.bannerKey) {
      await this.s3Service.delete(anime.bannerKey);
    }

    await this.animesRepository.update(animeId, { bannerKey: newKey });
  }
}
