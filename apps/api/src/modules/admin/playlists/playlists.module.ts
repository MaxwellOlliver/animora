import { Module } from '@nestjs/common';
import { PlaylistsAdminController } from './playlists-admin.controller';
import { PlaylistsRepository } from './playlists.repository';
import { SeriesModule } from '../series/series.module';
import { CreatePlaylistUseCase } from './use-cases/create-playlist.use-case';
import { GetPlaylistsUseCase } from './use-cases/get-playlists.use-case';
import { GetPlaylistUseCase } from './use-cases/get-playlist.use-case';
import { UpdatePlaylistUseCase } from './use-cases/update-playlist.use-case';
import { DeletePlaylistUseCase } from './use-cases/delete-playlist.use-case';
import { UploadPlaylistCoverUseCase } from './use-cases/upload-playlist-cover.use-case';

@Module({
  imports: [SeriesModule],
  controllers: [PlaylistsAdminController],
  providers: [
    PlaylistsRepository,
    CreatePlaylistUseCase,
    GetPlaylistsUseCase,
    GetPlaylistUseCase,
    UpdatePlaylistUseCase,
    DeletePlaylistUseCase,
    UploadPlaylistCoverUseCase,
  ],
})
export class PlaylistsModule {}
