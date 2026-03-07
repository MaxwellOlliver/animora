import type { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';

import { MEDIA_PURPOSE } from '@animora/contracts';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';
import { UploadMediaUseCase } from '@/modules/media/use-cases/upload-media.use-case';

import { SeriesRepository } from '../series.repository';

@Injectable()
export class UploadSeriesBannerUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly uploadMediaUseCase: UploadMediaUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(seriesId: string, file: MultipartFile): Promise<void> {
    const s = await this.seriesRepository.findById(seriesId);
    if (!s) throw new NotFoundException('Series not found');

    if (s.bannerId) {
      await this.deleteMediaUseCase.execute(s.bannerId);
    }

    const media = await this.uploadMediaUseCase.execute(
      file,
      MEDIA_PURPOSE.seriesBanner,
    );

    await this.seriesRepository.update(seriesId, { bannerId: media.id });
  }
}
