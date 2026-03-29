import { Injectable, NotFoundException } from '@nestjs/common';

import { SeriesRepository } from '../../series/repositories/series.repository';
import {
  TrailersRepository,
  type TrailerWithContext,
  type TrailerWithMedia,
} from '../trailers.repository';

@Injectable()
export class GetTrailersUseCase {
  constructor(
    private readonly trailersRepository: TrailersRepository,
    private readonly seriesRepository: SeriesRepository,
  ) {}

  async execute(
    seriesId?: string,
  ): Promise<TrailerWithMedia[] | TrailerWithContext[]> {
    if (seriesId) {
      const seriesEntity = await this.seriesRepository.findById(seriesId);
      if (!seriesEntity) throw new NotFoundException('Series not found');

      return this.trailersRepository.findBySeriesId(seriesId);
    }

    return this.trailersRepository.findAll();
  }
}
