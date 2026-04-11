import { Injectable } from '@nestjs/common';

import { ContentClassificationsRepository } from '@/modules/admin/content-classifications/content-classifications.repository';
import { GetSeriesByIdUseCase } from '@/modules/admin/series/use-cases/get-series-by-id.use-case';
import { SeriesReviewsRepository } from '@/modules/series-reviews/series-reviews.repository';

@Injectable()
export class GetSeriesDetailUseCase {
  constructor(
    private readonly getSeriesByIdUseCase: GetSeriesByIdUseCase,
    private readonly classificationsRepository: ContentClassificationsRepository,
    private readonly seriesReviewsRepository: SeriesReviewsRepository,
  ) {}

  async execute(id: string) {
    const series = await this.getSeriesByIdUseCase.execute(id);

    const [classification, rating] = await Promise.all([
      this.classificationsRepository.findById(series.contentClassificationId),
      this.seriesReviewsRepository.getAverageRating(id),
    ]);

    return {
      ...series,
      contentClassification: classification
        ? {
            id: classification.id,
            name: classification.name,
            description: classification.description,
            icon: classification.icon,
          }
        : null,
      rating: {
        average: Math.round(rating.average * 10) / 10,
        count: rating.count,
      },
    };
  }
}
