import { Injectable, NotFoundException } from '@nestjs/common';

import type { SeriesWithDetails } from '../series.entity';
import { SeriesRepository } from '../series.repository';

@Injectable()
export class GetSeriesByIdUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute(id: string): Promise<SeriesWithDetails> {
    const s = await this.seriesRepository.findById(id);
    if (!s) throw new NotFoundException('Series not found');
    return s;
  }
}
