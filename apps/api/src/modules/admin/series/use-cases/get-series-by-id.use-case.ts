import { Injectable, NotFoundException } from '@nestjs/common';
import { SeriesRepository } from '../series.repository';
import type { SeriesWithDetails } from '../series.entity';

@Injectable()
export class GetSeriesByIdUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute(id: string): Promise<SeriesWithDetails> {
    const s = await this.seriesRepository.findById(id);
    if (!s) throw new NotFoundException('Series not found');
    return s;
  }
}
