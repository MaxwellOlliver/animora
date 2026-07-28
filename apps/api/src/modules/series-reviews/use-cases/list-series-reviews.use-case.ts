import { Injectable, NotFoundException } from '@nestjs/common';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';
import { SeriesRepository } from '@/modules/admin/series/repositories/series.repository';

import type { SeriesReviewWithProfile } from '../series-reviews.repository';
import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class ListSeriesReviewsUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
    private readonly seriesRepository: SeriesRepository,
  ) {}

  async execute(input: {
    seriesId: string;
    pagination: CursorPaginatedRequest;
  }): Promise<CursorPaginatedResponse<SeriesReviewWithProfile>> {
    const series = await this.seriesRepository.findById(input.seriesId, true);
    if (!series) {
      throw new NotFoundException('Series not found');
    }

    return this.seriesReviewsRepository.findBySeriesCursor(
      input.seriesId,
      input.pagination,
    );
  }
}
