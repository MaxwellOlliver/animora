import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { PlaylistsRepository } from '../playlists.repository';
import { S3Service } from '@/infra/s3/s3.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class UploadPlaylistCoverUseCase {
  constructor(
    private readonly playlistsRepository: PlaylistsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string, file: MultipartFile): Promise<void> {
    const playlist = await this.playlistsRepository.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const buffer = await file.toBuffer();
    const ext = MIME_TO_EXT[file.mimetype];
    const newKey = await this.s3Service.upload(
      'covers',
      buffer,
      file.mimetype,
      ext,
    );

    if (playlist.coverKey) {
      await this.s3Service.delete(playlist.coverKey);
    }

    await this.playlistsRepository.update(id, { coverKey: newKey });
  }
}
