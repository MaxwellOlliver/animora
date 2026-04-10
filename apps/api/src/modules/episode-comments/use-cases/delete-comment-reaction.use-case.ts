import { Injectable, NotFoundException } from '@nestjs/common';

import { EpisodeCommentReactionsRepository } from '../repositories/episode-comment-reactions.repository';
import { EpisodeCommentsRepository } from '../repositories/episode-comments.repository';

@Injectable()
export class DeleteCommentReactionUseCase {
  constructor(
    private readonly reactionsRepository: EpisodeCommentReactionsRepository,
    private readonly commentsRepository: EpisodeCommentsRepository,
  ) {}

  async execute(input: {
    profileId: string;
    commentId: string;
  }): Promise<void> {
    const comment = await this.commentsRepository.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.reactionsRepository.delete(input.profileId, input.commentId);
  }
}
