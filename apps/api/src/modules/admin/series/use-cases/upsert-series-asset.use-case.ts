import type { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';

import { MEDIA_PURPOSE, type MediaPurpose } from '@animora/contracts';

import { DeleteMediaUseCase } from '@/modules/media/use-cases/delete-media.use-case';
import { UploadMediaUseCase } from '@/modules/media/use-cases/upload-media.use-case';

import type { SeriesAssetPurpose } from '../dto/series-asset.dto';
import { SeriesAssetsRepository } from '../series-assets.repository';
import type { SeriesWithDetailsAndMedia } from '../series.repository';
import { SeriesRepository } from '../series.repository';

const PURPOSE_TO_MEDIA: Record<SeriesAssetPurpose, MediaPurpose> = {
  banner: MEDIA_PURPOSE.seriesBanner,
  logo: MEDIA_PURPOSE.seriesLogo,
  trailer: MEDIA_PURPOSE.seriesTrailer,
};

@Injectable()
export class UpsertSeriesAssetUseCase {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly seriesAssetsRepository: SeriesAssetsRepository,
    private readonly uploadMediaUseCase: UploadMediaUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
  ) {}

  async execute(
    seriesId: string,
    purpose: SeriesAssetPurpose,
    file: MultipartFile,
  ): Promise<SeriesWithDetailsAndMedia> {
    const s = await this.seriesRepository.findById(seriesId);
    if (!s) throw new NotFoundException('Series not found');

    const existing = s.assets.find((a) => a.purpose === purpose);

    const media = await this.uploadMediaUseCase.execute(
      file,
      PURPOSE_TO_MEDIA[purpose],
    );

    await this.seriesAssetsRepository.upsert({
      seriesId,
      mediaId: media.id,
      purpose,
    });

    if (existing) {
      await this.deleteMediaUseCase.execute(existing.mediaId);
    }

    return this.seriesRepository.findById(
      seriesId,
    ) as Promise<SeriesWithDetailsAndMedia>;
  }
}
