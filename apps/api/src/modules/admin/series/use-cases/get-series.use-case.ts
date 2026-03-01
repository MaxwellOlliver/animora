import { Injectable } from '@nestjs/common';
import { SeriesRepository } from '../series.repository';
import type { SeriesWithDetails } from '../series.entity';

@Injectable()
export class GetSeriesUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute(): Promise<SeriesWithDetails[]> {
    return this.seriesRepository.findAll();
  }
}
