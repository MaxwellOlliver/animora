import { Injectable } from '@nestjs/common';

import { ContentClassificationsRepository } from '@/modules/admin/content-classifications/content-classifications.repository';
import { GetSeriesByIdUseCase } from '@/modules/admin/series/use-cases/get-series-by-id.use-case';

@Injectable()
export class GetSeriesDetailUseCase {
  constructor(
    private readonly getSeriesByIdUseCase: GetSeriesByIdUseCase,
    private readonly classificationsRepository: ContentClassificationsRepository,
  ) {}

  async execute(id: string) {
    const series = await this.getSeriesByIdUseCase.execute(id);

    const classification = await this.classificationsRepository.findById(
      series.contentClassificationId,
    );

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
    };
  }
}
