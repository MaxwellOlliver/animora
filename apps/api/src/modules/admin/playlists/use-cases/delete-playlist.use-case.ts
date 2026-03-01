import { Injectable, NotFoundException } from '@nestjs/common';
import { PlaylistsRepository } from '../playlists.repository';
import { S3Service } from '@/infra/s3/s3.service';

@Injectable()
export class DeletePlaylistUseCase {
  constructor(
    private readonly playlistsRepository: PlaylistsRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string): Promise<void> {
    const playlist = await this.playlistsRepository.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');

    if (playlist.coverKey) {
      await this.s3Service.delete(playlist.coverKey);
    }

    await this.playlistsRepository.delete(id);
  }
}
