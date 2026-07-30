import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';

import type { EpisodeTimestamp } from '../episode-timestamp.entity';
import type { TimestampSegment } from '../episode-timestamps.repository';
import { EpisodeTimestampsRepository } from '../episode-timestamps.repository';

@Injectable()
export class SetEpisodeTimestampsUseCase {
  constructor(
    private readonly episodeTimestampsRepository: EpisodeTimestampsRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

  async execute(input: {
    episodeId: string;
    timestamps: TimestampSegment[];
  }): Promise<EpisodeTimestamp[]> {
    const episode = await this.episodesRepository.findById(input.episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const seenTypes = new Set<string>();
    for (const segment of input.timestamps) {
      if (segment.endSeconds <= segment.startSeconds) {
        throw new BadRequestException(
          `End time must be after start time for "${segment.type}"`,
        );
      }
      if (seenTypes.has(segment.type)) {
        throw new BadRequestException(
          `Duplicate timestamp type "${segment.type}"`,
        );
      }
      seenTypes.add(segment.type);
    }

    return this.episodeTimestampsRepository.setForEpisode(
      input.episodeId,
      input.timestamps,
    );
  }
}
