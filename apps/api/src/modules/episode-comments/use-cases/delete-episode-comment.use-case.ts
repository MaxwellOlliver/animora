import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EpisodeCommentsRepository } from '../repositories/episode-comments.repository';

@Injectable()
export class DeleteEpisodeCommentUseCase {
  constructor(private readonly commentsRepository: EpisodeCommentsRepository) {}

  async execute(input: {
    profileId: string;
    commentId: string;
  }): Promise<void> {
    const comment = await this.commentsRepository.findById(input.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.profileId !== input.profileId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.delete(input.commentId);
  }
}
