import { Injectable } from '@nestjs/common';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';

import type { SeriesWithDetails } from '../series.entity';
import { SeriesRepository } from '../series.repository';

@Injectable()
export class GetSeriesUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute(
    input: CursorPaginatedRequest,
  ): Promise<CursorPaginatedResponse<SeriesWithDetails>> {
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);

    return this.seriesRepository.findAllCursor({
      cursor: input.cursor,
      limit,
    });
  }
}
