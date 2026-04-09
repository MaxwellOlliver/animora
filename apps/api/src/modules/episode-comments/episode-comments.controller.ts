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
import { CreateEpisodeCommentUseCase } from './use-cases/create-episode-comment.use-case';
import { DeleteEpisodeCommentUseCase } from './use-cases/delete-episode-comment.use-case';
import { ListEpisodeCommentsUseCase } from './use-cases/list-episode-comments.use-case';
import { UpdateEpisodeCommentUseCase } from './use-cases/update-episode-comment.use-case';

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
  ) {}

  @Get('episodes/:episodeId/comments')
  @ApiOperation({ summary: 'List comments for an episode' })
  list(
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @Query() query: ListEpisodeCommentsQueryDto,
  ) {
    return this.listCommentsUseCase.execute({
      episodeId,
      parentId: query.parentId,
      pagination: { cursor: query.cursor, limit: query.limit },
    });
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
}
