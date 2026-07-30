import { Module } from '@nestjs/common';

import { SeriesModule } from '../admin/series/series.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { GetWatchLaterStatusUseCase } from './use-cases/get-watch-later-status.use-case';
import { ListWatchLaterUseCase } from './use-cases/list-watch-later.use-case';
import { MarkWatchLaterUseCase } from './use-cases/mark-watch-later.use-case';
import { UnmarkWatchLaterUseCase } from './use-cases/unmark-watch-later.use-case';
import { WatchLaterController } from './watch-later.controller';
import { WatchLaterRepository } from './watch-later.repository';

@Module({
  imports: [ProfilesModule, SeriesModule],
  controllers: [WatchLaterController],
  providers: [
    WatchLaterRepository,
    MarkWatchLaterUseCase,
    UnmarkWatchLaterUseCase,
    GetWatchLaterStatusUseCase,
    ListWatchLaterUseCase,
  ],
  exports: [WatchLaterRepository],
})
export class WatchLaterModule {}
