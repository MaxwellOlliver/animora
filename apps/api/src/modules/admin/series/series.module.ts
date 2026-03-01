import { Module } from '@nestjs/common';
import { SeriesAdminController } from './series-admin.controller';
import { SeriesRepository } from './series.repository';
import { GenresModule } from '../genres/genres.module';
import { ContentClassificationsModule } from '../content-classifications/content-classifications.module';
import { CreateSeriesUseCase } from './use-cases/create-series.use-case';
import { GetSeriesUseCase } from './use-cases/get-series.use-case';
import { GetSeriesByIdUseCase } from './use-cases/get-series-by-id.use-case';
import { UpdateSeriesUseCase } from './use-cases/update-series.use-case';
import { DeleteSeriesUseCase } from './use-cases/delete-series.use-case';
import { UploadSeriesBannerUseCase } from './use-cases/upload-series-banner.use-case';

@Module({
  imports: [GenresModule, ContentClassificationsModule],
  controllers: [SeriesAdminController],
  providers: [
    SeriesRepository,
    CreateSeriesUseCase,
    GetSeriesUseCase,
    GetSeriesByIdUseCase,
    UpdateSeriesUseCase,
    DeleteSeriesUseCase,
    UploadSeriesBannerUseCase,
  ],
  exports: [SeriesRepository],
})
export class SeriesModule {}
