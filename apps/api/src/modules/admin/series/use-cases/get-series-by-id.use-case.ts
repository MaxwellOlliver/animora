import { Injectable, NotFoundException } from '@nestjs/common';

import {
  SeriesRepository,
  type SeriesWithDetailsAndMedia,
} from '../repositories/series.repository';

@Injectable()
export class GetSeriesByIdUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute(id: string): Promise<SeriesWithDetailsAndMedia> {
    const s = await this.seriesRepository.findById(id);
    if (!s) throw new NotFoundException('Series not found');
    return s;
  }
}
