import { Module } from '@nestjs/common';
import { EpisodesAdminController } from './episodes-admin.controller';
import { EpisodesRepository } from './episodes.repository';
import { PlaylistsModule } from '../playlists/playlists.module';
import { CreateEpisodeUseCase } from './use-cases/create-episode.use-case';
import { GetEpisodesUseCase } from './use-cases/get-episodes.use-case';
import { GetEpisodeUseCase } from './use-cases/get-episode.use-case';
import { UpdateEpisodeUseCase } from './use-cases/update-episode.use-case';
import { DeleteEpisodeUseCase } from './use-cases/delete-episode.use-case';
import { UploadEpisodeThumbnailUseCase } from './use-cases/upload-episode-thumbnail.use-case';

@Module({
  imports: [PlaylistsModule],
  controllers: [EpisodesAdminController],
  providers: [
    EpisodesRepository,
    CreateEpisodeUseCase,
    GetEpisodesUseCase,
    GetEpisodeUseCase,
    UpdateEpisodeUseCase,
    DeleteEpisodeUseCase,
    UploadEpisodeThumbnailUseCase,
  ],
  exports: [EpisodesRepository],
})
export class EpisodesModule {}
