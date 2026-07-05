import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { EpisodesRepository } from './episodes.repository';

@Controller()
export class EpisodesInternalController {
  constructor(private readonly episodesRepository: EpisodesRepository) {}

  @GrpcMethod('EpisodesInternal', 'EpisodeExists')
  async episodeExists({ episodeId }: { episodeId: string }) {
    const episode = await this.episodesRepository.findById(episodeId);
    return { exists: !!episode };
  }
}
