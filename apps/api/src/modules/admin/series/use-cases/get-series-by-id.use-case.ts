import { Injectable, NotFoundException } from '@nestjs/common';

import {
  SeriesRepository,
  type SeriesWithDetailsAndMedia,
} from '../repositories/series.repository';

@Injectable()
export class GetSeriesByIdUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute(
    id: string,
    activeOnly = false,
  ): Promise<SeriesWithDetailsAndMedia> {
    const s = await this.seriesRepository.findById(id, activeOnly);
    if (!s) throw new NotFoundException('Series not found');
    return s;
  }
}
