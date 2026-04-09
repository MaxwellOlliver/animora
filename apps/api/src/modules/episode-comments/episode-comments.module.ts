import { Module } from '@nestjs/common';

import { EpisodesModule } from '../admin/episodes/episodes.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { EpisodeCommentsController } from './episode-comments.controller';
import { EpisodeCommentsRepository } from './episode-comments.repository';
import { CreateEpisodeCommentUseCase } from './use-cases/create-episode-comment.use-case';
import { DeleteEpisodeCommentUseCase } from './use-cases/delete-episode-comment.use-case';
import { ListEpisodeCommentsUseCase } from './use-cases/list-episode-comments.use-case';
import { UpdateEpisodeCommentUseCase } from './use-cases/update-episode-comment.use-case';

@Module({
  imports: [ProfilesModule, EpisodesModule],
  controllers: [EpisodeCommentsController],
  providers: [
    EpisodeCommentsRepository,
    CreateEpisodeCommentUseCase,
    UpdateEpisodeCommentUseCase,
    DeleteEpisodeCommentUseCase,
    ListEpisodeCommentsUseCase,
  ],
  exports: [EpisodeCommentsRepository],
})
export class EpisodeCommentsModule {}
