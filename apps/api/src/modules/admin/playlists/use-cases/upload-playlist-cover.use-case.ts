import { MEDIA_PURPOSE } from '@animora/contracts';
import type { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';
import { UploadMediaUseCase } from '@/modules/media/use-cases/upload-media.use-case';

import { PlaylistsRepository } from '../playlists.repository';

@Injectable()
export class UploadPlaylistCoverUseCase {
  constructor(
    private readonly playlistsRepository: PlaylistsRepository,
    private readonly uploadMediaUseCase: UploadMediaUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string, file: MultipartFile): Promise<void> {
    const playlist = await this.playlistsRepository.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');

    if (playlist.coverId) {
      await this.deleteMediaUseCase.execute(playlist.coverId);
    }

    const media = await this.uploadMediaUseCase.execute(
      file,
      MEDIA_PURPOSE.playlistCover,
    );

    await this.playlistsRepository.update(id, { coverId: media.id });
  }
}
