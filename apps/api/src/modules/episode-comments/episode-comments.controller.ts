import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActiveProfile } from '@/common/decorators/active-profile.decorator';
import { ActiveProfileGuard } from '@/common/guards/active-profile.guard';

import type { ProfileWithAvatar } from '../profiles/profiles.repository';
import { CreateEpisodeCommentDto } from './dto/create-episode-comment.dto';
import { ListEpisodeCommentsQueryDto } from './dto/list-episode-comments-query.dto';
import { UpdateEpisodeCommentDto } from './dto/update-episode-comment.dto';
import { UpsertCommentReactionDto } from './dto/upsert-comment-reaction.dto';
import { CountEpisodeCommentsUseCase } from './use-cases/count-episode-comments.use-case';
import { CreateEpisodeCommentUseCase } from './use-cases/create-episode-comment.use-case';
import { DeleteCommentReactionUseCase } from './use-cases/delete-comment-reaction.use-case';
import { DeleteEpisodeCommentUseCase } from './use-cases/delete-episode-comment.use-case';
import { ListEpisodeCommentsUseCase } from './use-cases/list-episode-comments.use-case';
import { UpdateEpisodeCommentUseCase } from './use-cases/update-episode-comment.use-case';
import { UpsertCommentReactionUseCase } from './use-cases/upsert-comment-reaction.use-case';

@ApiTags('Episode Comments')
@Controller()
@UseGuards(ActiveProfileGuard)
@ApiBearerAuth()
export class EpisodeCommentsController {
  constructor(
    private readonly createCommentUseCase: CreateEpisodeCommentUseCase,
    private readonly updateCommentUseCase: UpdateEpisodeCommentUseCase,
    private readonly deleteCommentUseCase: DeleteEpisodeCommentUseCase,
    private readonly listCommentsUseCase: ListEpisodeCommentsUseCase,
    private readonly countCommentsUseCase: CountEpisodeCommentsUseCase,
    private readonly upsertReactionUseCase: UpsertCommentReactionUseCase,
    private readonly deleteReactionUseCase: DeleteCommentReactionUseCase,
  ) {}

  @Get('episodes/:episodeId/comments')
  @ApiOperation({ summary: 'List comments for an episode' })
  list(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @Query() query: ListEpisodeCommentsQueryDto,
  ) {
    return this.listCommentsUseCase.execute({
      episodeId,
      parentId: query.parentId,
      viewerProfileId: activeProfile.id,
      pagination: { cursor: query.cursor, limit: query.limit },
    });
  }

  @Get('episodes/:episodeId/comments/count')
  @ApiOperation({ summary: 'Get total comment count for an episode' })
  count(@Param('episodeId', ParseUUIDPipe) episodeId: string) {
    return this.countCommentsUseCase.execute({ episodeId });
  }

  @Post('episodes/:episodeId/comments')
  @ApiOperation({ summary: 'Create a comment on an episode' })
  create(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @Body() dto: CreateEpisodeCommentDto,
  ) {
    return this.createCommentUseCase.execute({
      profileId: activeProfile.id,
      episodeId,
      text: dto.text,
      spoiler: dto.spoiler,
      parentId: dto.parentId,
      replyToId: dto.replyToId,
    });
  }

  @Patch('comments/:commentId')
  @ApiOperation({ summary: 'Update your own comment' })
  update(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateEpisodeCommentDto,
  ) {
    return this.updateCommentUseCase.execute({
      profileId: activeProfile.id,
      commentId,
      text: dto.text,
    });
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete your own comment' })
  delete(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.deleteCommentUseCase.execute({
      profileId: activeProfile.id,
      commentId,
    });
  }

  @Put('comments/:commentId/reaction')
  @ApiOperation({ summary: 'Like or dislike a comment' })
  upsertReaction(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpsertCommentReactionDto,
  ) {
    return this.upsertReactionUseCase.execute({
      profileId: activeProfile.id,
      commentId,
      value: dto.value,
    });
  }

  @Delete('comments/:commentId/reaction')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove your reaction on a comment' })
  deleteReaction(
    @ActiveProfile() activeProfile: ProfileWithAvatar,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.deleteReactionUseCase.execute({
      profileId: activeProfile.id,
      commentId,
    });
  }
}
