import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { EpisodeComment } from '../entities/episode-comment.entity';
import { EpisodeCommentsRepository } from '../repositories/episode-comments.repository';

@Injectable()
export class UpdateEpisodeCommentUseCase {
  constructor(private readonly commentsRepository: EpisodeCommentsRepository) {}

  async execute(input: {
    profileId: string;
    commentId: string;
    text: string;
  }): Promise<EpisodeComment> {
    const comment = await this.commentsRepository.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.profileId !== input.profileId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.commentsRepository.update(input.commentId, {
      text: input.text,
    });
  }
}
