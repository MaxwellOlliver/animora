import { Injectable } from '@nestjs/common';

import type { EpisodeTimestamp } from '../episode-timestamp.entity';
import { EpisodeTimestampsRepository } from '../episode-timestamps.repository';

@Injectable()
export class GetEpisodeTimestampsUseCase {
  constructor(
    private readonly episodeTimestampsRepository: EpisodeTimestampsRepository,
  ) {}

  async execute(episodeId: string): Promise<EpisodeTimestamp[]> {
    return this.episodeTimestampsRepository.findByEpisodeId(episodeId);
  }
}
