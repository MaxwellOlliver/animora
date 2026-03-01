import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { EpisodesRepository } from '../episodes.repository';
import { S3Service } from '@/infra/s3/s3.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class UploadEpisodeThumbnailUseCase {
  constructor(
    private readonly episodesRepository: EpisodesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string, file: MultipartFile): Promise<void> {
    const episode = await this.episodesRepository.findById(id);
    if (!episode) throw new NotFoundException('Episode not found');

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const buffer = await file.toBuffer();
    const ext = MIME_TO_EXT[file.mimetype];
    const newKey = await this.s3Service.upload(
      'thumbnails',
      buffer,
      file.mimetype,
      ext,
    );

    if (episode.thumbnailKey) {
      await this.s3Service.delete(episode.thumbnailKey);
    }

    await this.episodesRepository.update(id, { thumbnailKey: newKey });
  }
}
