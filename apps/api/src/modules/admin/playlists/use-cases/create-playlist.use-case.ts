import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlaylistsRepository } from '../playlists.repository';
import { SeriesRepository } from '../../series/series.repository';
import type { CreatePlaylistDto } from '../dto/create-playlist.dto';
import type { Playlist } from '../playlist.entity';

@Injectable()
export class CreatePlaylistUseCase {
  constructor(
    private readonly playlistsRepository: PlaylistsRepository,
    private readonly seriesRepository: SeriesRepository,
  ) {}

  async execute(dto: CreatePlaylistDto): Promise<Playlist> {
    const s = await this.seriesRepository.findById(dto.seriesId);
    if (!s) throw new NotFoundException('Series not found');

    const existing = await this.playlistsRepository.findBySeriesId(
      dto.seriesId,
    );
    const conflict = existing.find((p) => p.number === dto.number);
    if (conflict) {
      throw new ConflictException(
        `A playlist with number ${dto.number} already exists in this series`,
      );
    }

    return this.playlistsRepository.create({
      seriesId: dto.seriesId,
      type: dto.type,
      number: dto.number,
      title: dto.title,
    });
  }
}
