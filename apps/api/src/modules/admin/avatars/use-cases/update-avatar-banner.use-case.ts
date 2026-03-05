import type { MultipartFile } from '@fastify/multipart';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { S3Service } from '@/infra/s3/s3.service';

import { AvatarsRepository } from '../avatars.repository';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class UpdateAvatarBannerUseCase {
  constructor(
    private readonly avatarsRepository: AvatarsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string, file: MultipartFile): Promise<void> {
    const avatar = await this.avatarsRepository.findById(id);
    if (!avatar) throw new NotFoundException('Avatar not found');

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const buffer = await file.toBuffer();
    const ext = MIME_TO_EXT[file.mimetype];
    const newKey = await this.s3Service.upload(
      'avatars',
      buffer,
      file.mimetype,
      ext,
    );

    if (avatar.pictureKey) {
      await this.s3Service.delete(avatar.pictureKey);
    }

    await this.avatarsRepository.update(id, { pictureKey: newKey });
  }
}
