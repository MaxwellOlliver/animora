import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { DatabaseModule } from './infra/database/database.module';
import { RabbitMQModule } from './infra/rabbitmq/rabbitmq.module';
import { S3Module } from './infra/s3/s3.module';
import { AvatarsModule } from './modules/admin/avatars/avatars.module';
import { ContentClassificationsModule } from './modules/admin/content-classifications/content-classifications.module';
import { EpisodesModule } from './modules/admin/episodes/episodes.module';
import { GenresModule } from './modules/admin/genres/genres.module';
import { PlaylistsModule } from './modules/admin/playlists/playlists.module';
import { SeriesModule } from './modules/admin/series/series.module';
import { UploadsModule } from './modules/admin/uploads/uploads.module';
import { VideosModule } from './modules/admin/videos/videos.module';
import { MediaModule } from './modules/media/media.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    S3Module,
    RabbitMQModule,
    MediaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    AvatarsModule,
    GenresModule,
    ContentClassificationsModule,
    SeriesModule,
    PlaylistsModule,
    EpisodesModule,
    VideosModule,
    UploadsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
