import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';

import { RedisModule } from '@/infra/redis/redis.module';

import { EpisodesModule } from '../admin/episodes/episodes.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { ApplyPlaybackEventUseCase } from './use-cases/apply-playback-event.use-case';
import { CreateSessionUseCase } from './use-cases/create-session.use-case';
import { GetSessionSnapshotUseCase } from './use-cases/get-session-snapshot.use-case';
import { JoinSessionUseCase } from './use-cases/join-session.use-case';
import { KickMemberUseCase } from './use-cases/kick-member.use-case';
import { LeaveSessionUseCase } from './use-cases/leave-session.use-case';
import { PostChatMessageUseCase } from './use-cases/post-chat-message.use-case';
import { WatchPartyController } from './watch-party.controller';
import { WatchPartyGateway } from './watch-party.gateway';
import { WatchPartyRepository } from './watch-party.repository';

@Module({
  imports: [
    RedisModule,
    ProfilesModule,
    EpisodesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow(
            'JWT_EXPIRATION',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [WatchPartyController],
  providers: [
    WatchPartyRepository,
    CreateSessionUseCase,
    JoinSessionUseCase,
    LeaveSessionUseCase,
    GetSessionSnapshotUseCase,
    PostChatMessageUseCase,
    ApplyPlaybackEventUseCase,
    KickMemberUseCase,
    WatchPartyGateway,
  ],
})
export class WatchPartyModule {}
