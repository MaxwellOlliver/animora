import { Injectable } from '@nestjs/common';

import { GetSeriesUseCase } from '@/modules/admin/series/use-cases/get-series.use-case';

@Injectable()
export class GetRecommendedUseCase {
  constructor(private readonly getSeriesUseCase: GetSeriesUseCase) {}

  async execute(input: { cursor?: string; limit?: number }) {
    return this.getSeriesUseCase.execute(input);
  }
}
