import { Module } from '@nestjs/common';

import { MediaModule } from '@/modules/media/media.module';

import { SeriesModule } from '../series/series.module';
import { VideosModule } from '../videos/videos.module';
import { TrailersRepository } from './trailers.repository';
import { TrailersAdminController } from './trailers-admin.controller';
import { CreateTrailerUseCase } from './use-cases/create-trailer.use-case';
import { DeleteTrailerUseCase } from './use-cases/delete-trailer.use-case';
import { GetTrailerUseCase } from './use-cases/get-trailer.use-case';
import { GetTrailersUseCase } from './use-cases/get-trailers.use-case';
import { UpdateTrailerUseCase } from './use-cases/update-trailer.use-case';
import { UploadTrailerThumbnailUseCase } from './use-cases/upload-trailer-thumbnail.use-case';

@Module({
  imports: [SeriesModule, MediaModule, VideosModule],
  controllers: [TrailersAdminController],
  providers: [
    TrailersRepository,
    CreateTrailerUseCase,
    GetTrailersUseCase,
    GetTrailerUseCase,
    UpdateTrailerUseCase,
    DeleteTrailerUseCase,
    UploadTrailerThumbnailUseCase,
  ],
  exports: [TrailersRepository],
})
export class TrailersModule {}
