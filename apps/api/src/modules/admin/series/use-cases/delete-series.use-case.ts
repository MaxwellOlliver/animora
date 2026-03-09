import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';

import { SeriesAssetsRepository } from '../repositories/series-assets.repository';
import { SeriesRepository } from '../repositories/series.repository';

@Injectable()
export class DeleteSeriesUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly seriesAssetsRepository: SeriesAssetsRepository,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const s = await this.seriesRepository.findById(id);
    if (!s) throw new NotFoundException('Series not found');

    const assets = await this.seriesAssetsRepository.findBySeriesId(id);

    await this.seriesRepository.delete(id);

    if (s.bannerId) {
      await this.deleteMediaUseCase.execute(s.bannerId);
    }

    for (const asset of assets) {
      await this.deleteMediaUseCase.execute(asset.mediaId);
    }
  }
}
