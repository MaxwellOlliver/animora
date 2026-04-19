import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import type { JwtPayload } from '@/modules/auth/strategies/jwt.strategy';
import {
  ProfilesRepository,
  type ProfileWithAvatar,
} from '@/modules/profiles/profiles.repository';

import type {
  ChatSendPayload,
  MemberKickPayload,
  PlaybackSeekPayload,
} from './types/socket-events.types';
import {
  WP_CLIENT_EVENTS,
  WP_SERVER_EVENTS,
} from './types/socket-events.types';
import { ApplyPlaybackEventUseCase } from './use-cases/apply-playback-event.use-case';
import { JoinSessionUseCase } from './use-cases/join-session.use-case';
import { KickMemberUseCase } from './use-cases/kick-member.use-case';
import { LeaveSessionUseCase } from './use-cases/leave-session.use-case';
import { PostChatMessageUseCase } from './use-cases/post-chat-message.use-case';

interface WatchPartySocketData {
  profile: ProfileWithAvatar;
  code: string;
}

type WatchPartySocket = Socket;

function ctx(client: { data: unknown }): WatchPartySocketData {
  return client.data as WatchPartySocketData;
}

const DISCONNECT_GRACE_MS = 15_000;
const PLAYBACK_RATE_LIMIT_MS = 300;

function roomOf(code: string): string {
  return `wp:${code}`;
}

function timerKey(code: string, profileId: string): string {
  return `${code}:${profileId}`;
}

@WebSocketGateway({
  namespace: '/watch-party',
  cors: { origin: true, credentials: true },
})
export class WatchPartyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WatchPartyGateway.name);

  @WebSocketServer()
  private server!: Server;

  private readonly disconnectTimers = new Map<string, NodeJS.Timeout>();
  private readonly lastPlaybackAt = new Map<string, number>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly profilesRepository: ProfilesRepository,
    private readonly joinSession: JoinSessionUseCase,
    private readonly leaveSession: LeaveSessionUseCase,
    private readonly postChat: PostChatMessageUseCase,
    private readonly applyPlayback: ApplyPlaybackEventUseCase,
    private readonly kickMember: KickMemberUseCase,
  ) {}

  afterInit(server: Server) {
    server.use((socket, next) => {
      void (async () => {
        try {
          const auth = socket.handshake.auth as {
            token?: string;
            code?: string;
            profileId?: string;
          };
          const token = auth?.token;
          const code = auth?.code?.toUpperCase();
          const profileId = auth?.profileId;
          if (!token || !code || !profileId) {
            return next(new Error('Missing token, code or profileId'));
          }
          const payload = this.jwtService.verify<JwtPayload>(token);
          const profile = await this.profilesRepository.findOwnedByUser(
            profileId,
            payload.sub,
          );
          if (!profile) {
            return next(new Error('Profile does not belong to user'));
          }
          (socket.data as WatchPartySocketData) = { profile, code };
          next();
        } catch (err) {
          next(err instanceof Error ? err : new Error('Unauthorized'));
        }
      })();
    });
  }

  async handleConnection(client: WatchPartySocket) {
    const { profile, code } = ctx(client);

    try {
      const snapshot = await this.joinSession.execute({ code, profile });

      const existingTimer = this.disconnectTimers.get(
        timerKey(code, profile.id),
      );
      if (existingTimer) {
        clearTimeout(existingTimer);
        this.disconnectTimers.delete(timerKey(code, profile.id));
      }

      await client.join(roomOf(code));
      client.emit(WP_SERVER_EVENTS.SESSION_SNAPSHOT, snapshot);

      const member = snapshot.members.find((m) => m.profileId === profile.id);
      if (member) {
        client.to(roomOf(code)).emit(WP_SERVER_EVENTS.MEMBER_JOINED, member);
      }
    } catch (err) {
      this.logger.warn(`Connection rejected: ${(err as Error).message}`);
      client.emit(WP_SERVER_EVENTS.ERROR, {
        message: (err as Error).message,
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: WatchPartySocket) {
    const data = ctx(client);
    if (!data?.profile || !data?.code) return;
    const { profile, code } = data;

    this.lastPlaybackAt.delete(`${code}:${profile.id}`);

    const key = timerKey(code, profile.id);
    if (this.disconnectTimers.has(key)) return;

    const timer = setTimeout(() => {
      this.disconnectTimers.delete(key);
      void this.finalizeLeave(code, profile.id);
    }, DISCONNECT_GRACE_MS);
    this.disconnectTimers.set(key, timer);
  }

  private async finalizeLeave(code: string, profileId: string): Promise<void> {
    try {
      const sockets = await this.server.in(roomOf(code)).fetchSockets();
      const stillConnected = sockets.some(
        (s) => ctx(s)?.profile?.id === profileId,
      );
      if (stillConnected) return;

      const result = await this.leaveSession.execute({ code, profileId });
      this.server
        .to(roomOf(code))
        .emit(WP_SERVER_EVENTS.MEMBER_LEFT, { profileId });

      if (result.newOwnerProfileId) {
        this.server
          .to(roomOf(code))
          .emit(WP_SERVER_EVENTS.SESSION_OWNER_CHANGED, {
            ownerProfileId: result.newOwnerProfileId,
          });
      }

      if (result.sessionDeleted) {
        this.server
          .to(roomOf(code))
          .emit(WP_SERVER_EVENTS.SESSION_CLOSED, { reason: 'empty' });
      }
    } catch (err) {
      this.logger.error(`finalizeLeave failed: ${(err as Error).message}`);
    }
  }

  @SubscribeMessage(WP_CLIENT_EVENTS.CHAT_SEND)
  async onChatSend(
    @ConnectedSocket() client: WatchPartySocket,
    @MessageBody() payload: ChatSendPayload,
  ) {
    const { profile, code } = ctx(client);
    const content = payload?.content?.toString().slice(0, 500).trim();
    if (!content) return;

    const message = await this.postChat.execute({
      code,
      profileId: profile.id,
      content,
    });
    this.server.to(roomOf(code)).emit(WP_SERVER_EVENTS.CHAT_NEW, message);
  }

  @SubscribeMessage(WP_CLIENT_EVENTS.PLAYBACK_PLAY)
  onPlay(@ConnectedSocket() client: WatchPartySocket) {
    return this.handlePlayback(client, { type: 'play' });
  }

  @SubscribeMessage(WP_CLIENT_EVENTS.PLAYBACK_PAUSE)
  onPause(@ConnectedSocket() client: WatchPartySocket) {
    return this.handlePlayback(client, { type: 'pause' });
  }

  @SubscribeMessage(WP_CLIENT_EVENTS.PLAYBACK_SEEK)
  onSeek(
    @ConnectedSocket() client: WatchPartySocket,
    @MessageBody() payload: PlaybackSeekPayload,
  ) {
    if (typeof payload?.position !== 'number') return;
    return this.handlePlayback(client, {
      type: 'seek',
      position: payload.position,
    });
  }

  private async handlePlayback(
    client: WatchPartySocket,
    event:
      | { type: 'play' }
      | { type: 'pause' }
      | { type: 'seek'; position: number },
  ) {
    const { profile, code } = ctx(client);
    const key = `${code}:${profile.id}`;
    const now = Date.now();
    const last = this.lastPlaybackAt.get(key) ?? 0;
    if (now - last < PLAYBACK_RATE_LIMIT_MS) return;
    this.lastPlaybackAt.set(key, now);

    try {
      const broadcast = await this.applyPlayback.execute({
        code,
        actorProfileId: profile.id,
        event,
      });
      this.server
        .to(roomOf(code))
        .emit(WP_SERVER_EVENTS.PLAYBACK_STATE, broadcast);
    } catch (err) {
      client.emit(WP_SERVER_EVENTS.ERROR, {
        message: (err as Error).message,
      });
    }
  }

  @SubscribeMessage(WP_CLIENT_EVENTS.MEMBER_KICK)
  async onKick(
    @ConnectedSocket() client: WatchPartySocket,
    @MessageBody() payload: MemberKickPayload,
  ) {
    const { profile, code } = ctx(client);
    if (!payload?.profileId) return;

    try {
      await this.kickMember.execute({
        code,
        actorProfileId: profile.id,
        targetProfileId: payload.profileId,
      });
    } catch (err) {
      client.emit(WP_SERVER_EVENTS.ERROR, {
        message: (err as Error).message,
      });
      return;
    }

    this.server.to(roomOf(code)).emit(WP_SERVER_EVENTS.MEMBER_KICKED, {
      profileId: payload.profileId,
      byProfileId: profile.id,
    });

    const sockets = await this.server.in(roomOf(code)).fetchSockets();
    for (const s of sockets) {
      if (ctx(s)?.profile?.id === payload.profileId) {
        s.emit(WP_SERVER_EVENTS.SESSION_CLOSED, { reason: 'kicked' });
        s.disconnect(true);
      }
    }
  }
}
