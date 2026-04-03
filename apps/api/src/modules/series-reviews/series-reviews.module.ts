import { Module } from '@nestjs/common';

import { ProfilesModule } from '../profiles/profiles.module';
import { SeriesReviewsController } from './series-reviews.controller';
import { SeriesReviewsRepository } from './series-reviews.repository';
import { CreateReviewUseCase } from './use-cases/create-review.use-case';
import { DeleteReviewUseCase } from './use-cases/delete-review.use-case';
import { GetMyReviewUseCase } from './use-cases/get-my-review.use-case';
import { ListSeriesReviewsUseCase } from './use-cases/list-series-reviews.use-case';
import { UpdateReviewUseCase } from './use-cases/update-review.use-case';

@Module({
  imports: [ProfilesModule],
  controllers: [SeriesReviewsController],
  providers: [
    SeriesReviewsRepository,
    CreateReviewUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
    GetMyReviewUseCase,
    ListSeriesReviewsUseCase,
  ],
  exports: [SeriesReviewsRepository],
})
export class SeriesReviewsModule {}
