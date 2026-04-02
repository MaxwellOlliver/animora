import { Injectable } from '@nestjs/common';

import { TrailersRepository } from '@/modules/admin/trailers/trailers.repository';

@Injectable()
export class GetSeriesTrailersUseCase {
  constructor(private readonly trailersRepository: TrailersRepository) {}

  async execute(seriesId: string) {
    return this.trailersRepository.findBySeriesId(seriesId);
  }
}
