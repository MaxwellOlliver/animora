import { Injectable } from '@nestjs/common';

import { TrailersRepository } from '@/modules/admin/trailers/trailers.repository';

@Injectable()
export class GetSeriesFeaturedTrailerUseCase {
  constructor(private readonly trailersRepository: TrailersRepository) {}

  async execute(seriesId: string) {
    return (
      (await this.trailersRepository.findNewestBySeriesId(seriesId, true)) ??
      null
    );
  }
}
