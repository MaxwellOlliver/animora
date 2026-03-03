import { Injectable, NotFoundException } from '@nestjs/common';

import { S3Service } from '@/infra/s3/s3.service';

import { SeriesRepository } from '../series.repository';

@Injectable()
export class DeleteSeriesUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async execute(id: string): Promise<void> {
    const s = await this.seriesRepository.findById(id);
    if (!s) throw new NotFoundException('Series not found');

    if (s.bannerKey) {
      await this.s3Service.delete(s.bannerKey);
    }

    await this.seriesRepository.delete(id);
  }
}
