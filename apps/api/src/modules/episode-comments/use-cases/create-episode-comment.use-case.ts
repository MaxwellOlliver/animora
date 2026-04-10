import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';

import type { EpisodeComment } from '../entities/episode-comment.entity';
import { EpisodeCommentsRepository } from '../repositories/episode-comments.repository';

@Injectable()
export class CreateEpisodeCommentUseCase {
  constructor(
    private readonly commentsRepository: EpisodeCommentsRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

  async execute(input: {
    profileId: string;
    episodeId: string;
    text: string;
    spoiler?: boolean;
    parentId?: string;
    replyToId?: string;
  }): Promise<EpisodeComment> {
    const episode = await this.episodesRepository.findById(input.episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    if (input.parentId) {
      const parent = await this.commentsRepository.findById(input.parentId);
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
      if (parent.parentId !== null) {
        throw new BadRequestException(
          'parentId must reference a top-level comment',
        );
      }
    }

    if (input.replyToId) {
      if (!input.parentId) {
        throw new BadRequestException(
          'replyToId requires parentId to be set',
        );
      }
      const replyTo = await this.commentsRepository.findById(input.replyToId);
      if (!replyTo) {
        throw new NotFoundException('Reply-to comment not found');
      }
    }

    return this.commentsRepository.create({
      episodeId: input.episodeId,
      profileId: input.profileId,
      text: input.text,
      spoiler: input.spoiler ?? false,
      parentId: input.parentId ?? null,
      replyToId: input.replyToId ?? null,
    });
  }
}
