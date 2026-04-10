import { Module } from '@nestjs/common';

import { EpisodesModule } from '../admin/episodes/episodes.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { EpisodeCommentsController } from './episode-comments.controller';
import { EpisodeCommentReactionsRepository } from './repositories/episode-comment-reactions.repository';
import { EpisodeCommentsRepository } from './repositories/episode-comments.repository';
import { CountEpisodeCommentsUseCase } from './use-cases/count-episode-comments.use-case';
import { CreateEpisodeCommentUseCase } from './use-cases/create-episode-comment.use-case';
import { DeleteCommentReactionUseCase } from './use-cases/delete-comment-reaction.use-case';
import { DeleteEpisodeCommentUseCase } from './use-cases/delete-episode-comment.use-case';
import { ListEpisodeCommentsUseCase } from './use-cases/list-episode-comments.use-case';
import { UpdateEpisodeCommentUseCase } from './use-cases/update-episode-comment.use-case';
import { UpsertCommentReactionUseCase } from './use-cases/upsert-comment-reaction.use-case';

@Module({
  imports: [ProfilesModule, EpisodesModule],
  controllers: [EpisodeCommentsController],
  providers: [
    EpisodeCommentsRepository,
    EpisodeCommentReactionsRepository,
    CreateEpisodeCommentUseCase,
    CountEpisodeCommentsUseCase,
    UpdateEpisodeCommentUseCase,
    DeleteEpisodeCommentUseCase,
    ListEpisodeCommentsUseCase,
    UpsertCommentReactionUseCase,
    DeleteCommentReactionUseCase,
  ],
  exports: [EpisodeCommentsRepository],
})
export class EpisodeCommentsModule {}
