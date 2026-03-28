import { Module } from '@nestjs/common';

import { SeriesModule } from '@/modules/admin/series/series.module';

import { CatalogController } from './catalog.controller';
import { GetRecommendedUseCase } from './use-cases/get-recommended.use-case';

@Module({
  imports: [SeriesModule],
  controllers: [CatalogController],
  providers: [GetRecommendedUseCase],
})
export class CatalogModule {}
