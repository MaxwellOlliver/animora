import { Injectable } from '@nestjs/common';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';

import type { SeriesReviewWithProfile } from '../series-reviews.repository';
import { SeriesReviewsRepository } from '../series-reviews.repository';

@Injectable()
export class ListSeriesReviewsUseCase {
  constructor(
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
  ) {}

  async execute(input: {
    seriesId: string;
    pagination: CursorPaginatedRequest;
  }): Promise<CursorPaginatedResponse<SeriesReviewWithProfile>> {
    return this.seriesReviewsRepository.findBySeriesCursor(
      input.seriesId,
      input.pagination,
    );
  }
}
