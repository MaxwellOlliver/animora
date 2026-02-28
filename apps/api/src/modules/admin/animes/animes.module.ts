import { Module } from '@nestjs/common';
import { AnimesAdminController } from './animes-admin.controller';
import { AnimesRepository } from './animes.repository';
import { GenresModule } from '../genres/genres.module';
import { ContentClassificationsModule } from '../content-classifications/content-classifications.module';
import { CreateAnimeUseCase } from './use-cases/create-anime.use-case';
import { GetAnimesUseCase } from './use-cases/get-animes.use-case';
import { GetAnimeUseCase } from './use-cases/get-anime.use-case';
import { UpdateAnimeUseCase } from './use-cases/update-anime.use-case';
import { DeleteAnimeUseCase } from './use-cases/delete-anime.use-case';
import { UploadAnimeBannerUseCase } from './use-cases/upload-anime-banner.use-case';

@Module({
  imports: [GenresModule, ContentClassificationsModule],
  controllers: [AnimesAdminController],
  providers: [
    AnimesRepository,
    CreateAnimeUseCase,
    GetAnimesUseCase,
    GetAnimeUseCase,
    UpdateAnimeUseCase,
    DeleteAnimeUseCase,
    UploadAnimeBannerUseCase,
  ],
})
export class AnimesModule {}
