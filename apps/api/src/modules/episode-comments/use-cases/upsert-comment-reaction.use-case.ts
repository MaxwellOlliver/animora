import { Injectable, NotFoundException } from '@nestjs/common';

import type { EpisodeCommentReaction } from '../entities/episode-comment-reaction.entity';
import { EpisodeCommentReactionsRepository } from '../repositories/episode-comment-reactions.repository';
import { EpisodeCommentsRepository } from '../repositories/episode-comments.repository';

@Injectable()
export class UpsertCommentReactionUseCase {
  constructor(
    private readonly reactionsRepository: EpisodeCommentReactionsRepository,
    private readonly commentsRepository: EpisodeCommentsRepository,
  ) {}

  async execute(input: {
    profileId: string;
    commentId: string;
    value: 'like' | 'dislike';
  }): Promise<EpisodeCommentReaction> {
    const comment = await this.commentsRepository.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.reactionsRepository.upsert({
      profileId: input.profileId,
      commentId: input.commentId,
      value: input.value,
    });
  }
}
