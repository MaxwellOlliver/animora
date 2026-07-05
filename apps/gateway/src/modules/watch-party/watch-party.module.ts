import { Module } from '@nestjs/common';

import { ActiveProfileGuard } from '@/common/guards/active-profile.guard';

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
  controllers: [WatchPartyController],
  providers: [
    ActiveProfileGuard,
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
