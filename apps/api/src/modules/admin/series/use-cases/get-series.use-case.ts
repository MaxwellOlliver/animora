import { Injectable } from '@nestjs/common';

import type { SeriesWithDetails } from '../series.entity';
import { SeriesRepository } from '../series.repository';

@Injectable()
export class GetSeriesUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute(): Promise<SeriesWithDetails[]> {
    return this.seriesRepository.findAll();
  }
}
