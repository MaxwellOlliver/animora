import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './infra/database/database.module';
import { S3Module } from './infra/s3/s3.module';
import { RabbitMQModule } from './infra/rabbitmq/rabbitmq.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { GenresModule } from './modules/admin/genres/genres.module';
import { ContentClassificationsModule } from './modules/admin/content-classifications/content-classifications.module';
import { SeriesModule } from './modules/admin/series/series.module';
import { PlaylistsModule } from './modules/admin/playlists/playlists.module';
import { EpisodesModule } from './modules/admin/episodes/episodes.module';
import { VideosModule } from './modules/admin/videos/videos.module';
import { UploadsModule } from './modules/admin/uploads/uploads.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    S3Module,
    RabbitMQModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
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
