import { Injectable, NotFoundException } from '@nestjs/common';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';

import { SeriesRepository } from '../series.repository';

@Injectable()
export class DeleteSeriesUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const s = await this.seriesRepository.findById(id);
    if (!s) throw new NotFoundException('Series not found');

    await this.seriesRepository.delete(id);

    if (s.bannerId) {
      await this.deleteMediaUseCase.execute(s.bannerId);
    }
  }
}
