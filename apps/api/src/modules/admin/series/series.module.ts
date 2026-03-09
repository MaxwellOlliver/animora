import { Module } from '@nestjs/common';

import { MediaModule } from '@/modules/media/media.module';

import { ContentClassificationsModule } from '../content-classifications/content-classifications.module';
import { GenresModule } from '../genres/genres.module';
import { SeriesRepository } from './series.repository';
import { SeriesAdminController } from './series-admin.controller';
import { SeriesAssetsRepository } from './series-assets.repository';
import { CreateSeriesUseCase } from './use-cases/create-series.use-case';
import { DeleteSeriesUseCase } from './use-cases/delete-series.use-case';
import { GetSeriesUseCase } from './use-cases/get-series.use-case';
import { GetSeriesByIdUseCase } from './use-cases/get-series-by-id.use-case';
import { UpdateSeriesUseCase } from './use-cases/update-series.use-case';
import { UpsertSeriesAssetUseCase } from './use-cases/upsert-series-asset.use-case';

@Module({
  imports: [GenresModule, ContentClassificationsModule, MediaModule],
  controllers: [SeriesAdminController],
  providers: [
    SeriesRepository,
    SeriesAssetsRepository,
    CreateSeriesUseCase,
    GetSeriesUseCase,
    GetSeriesByIdUseCase,
    UpdateSeriesUseCase,
    DeleteSeriesUseCase,
    UpsertSeriesAssetUseCase,
  ],
  exports: [SeriesRepository],
})
export class SeriesModule {}
