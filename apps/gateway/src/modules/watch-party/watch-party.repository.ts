import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';

import { REDIS_CLIENT } from '@/infra/redis/redis.module';

import type {
  WatchPartyChatMessage,
  WatchPartyMember,
  WatchPartyPlaybackState,
  WatchPartySession,
} from './types/session.types';

const SESSION_TTL_SECONDS = 60 * 60 * 6;
const CHAT_BACKLOG_LIMIT = 50;

function sessionKey(code: string) {
  return `wp:session:${code}`;
}
function playbackKey(code: string) {
  return `wp:session:${code}:playback`;
}
function membersKey(code: string) {
  return `wp:session:${code}:members`;
}
function bannedKey(code: string) {
  return `wp:session:${code}:banned`;
}
function chatKey(code: string) {
  return `wp:session:${code}:chat`;
}

function allKeys(code: string) {
  return [
    sessionKey(code),
    playbackKey(code),
    membersKey(code),
    bannedKey(code),
    chatKey(code),
  ];
}

@Injectable()
export class WatchPartyRepository {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async createSession(session: WatchPartySession): Promise<void> {
    const playback: WatchPartyPlaybackState = {
      playing: false,
      anchorPosition: 0,
      anchorAt: Date.now(),
    };
    await this.redis
      .multi()
      .hset(sessionKey(session.code), {
        id: session.id,
        code: session.code,
        episodeId: session.episodeId,
        ownerProfileId: session.ownerProfileId,
        createdAt: String(session.createdAt),
        locked: session.locked ? '1' : '0',
      })
      .hset(playbackKey(session.code), {
        playing: '0',
        anchorPosition: String(playback.anchorPosition),
        anchorAt: String(playback.anchorAt),
      })
      .exec();
    await this.touch(session.code);
  }

  async findSession(code: string): Promise<WatchPartySession | null> {
    const raw = await this.redis.hgetall(sessionKey(code));
    if (!raw || Object.keys(raw).length === 0) return null;
    return {
      id: raw.id,
      code: raw.code,
      episodeId: raw.episodeId,
      ownerProfileId: raw.ownerProfileId,
      createdAt: Number(raw.createdAt),
      locked: raw.locked === '1',
    };
  }

  async setLocked(code: string, locked: boolean): Promise<void> {
    await this.redis.hset(sessionKey(code), 'locked', locked ? '1' : '0');
    await this.touch(code);
  }

  async setOwner(code: string, ownerProfileId: string): Promise<void> {
    await this.redis.hset(sessionKey(code), 'ownerProfileId', ownerProfileId);
    await this.touch(code);
  }

  async deleteSession(code: string): Promise<void> {
    await this.redis.del(...allKeys(code));
  }

  async getPlayback(code: string): Promise<WatchPartyPlaybackState | null> {
    const raw = await this.redis.hgetall(playbackKey(code));
    if (!raw || Object.keys(raw).length === 0) return null;
    return {
      playing: raw.playing === '1',
      anchorPosition: Number(raw.anchorPosition),
      anchorAt: Number(raw.anchorAt),
    };
  }

  async setPlayback(
    code: string,
    state: WatchPartyPlaybackState,
  ): Promise<void> {
    await this.redis.hset(playbackKey(code), {
      playing: state.playing ? '1' : '0',
      anchorPosition: String(state.anchorPosition),
      anchorAt: String(state.anchorAt),
    });
    await this.touch(code);
  }

  async addMember(code: string, member: WatchPartyMember): Promise<void> {
    await this.redis.hset(
      membersKey(code),
      member.profileId,
      JSON.stringify(member),
    );
    await this.touch(code);
  }

  async removeMember(code: string, profileId: string): Promise<void> {
    await this.redis.hdel(membersKey(code), profileId);
  }

  async findMember(
    code: string,
    profileId: string,
  ): Promise<WatchPartyMember | null> {
    const raw = await this.redis.hget(membersKey(code), profileId);
    if (!raw) return null;
    return JSON.parse(raw) as WatchPartyMember;
  }

  async listMembers(code: string): Promise<WatchPartyMember[]> {
    const raw = await this.redis.hgetall(membersKey(code));
    return Object.values(raw).map((v) => JSON.parse(v) as WatchPartyMember);
  }

  async memberCount(code: string): Promise<number> {
    return this.redis.hlen(membersKey(code));
  }

  async isBanned(code: string, profileId: string): Promise<boolean> {
    return (await this.redis.sismember(bannedKey(code), profileId)) === 1;
  }

  async ban(code: string, profileId: string): Promise<void> {
    await this.redis.sadd(bannedKey(code), profileId);
    await this.touch(code);
  }

  async pushChatMessage(
    code: string,
    message: WatchPartyChatMessage,
  ): Promise<void> {
    await this.redis
      .multi()
      .lpush(chatKey(code), JSON.stringify(message))
      .ltrim(chatKey(code), 0, CHAT_BACKLOG_LIMIT - 1)
      .exec();
    await this.touch(code);
  }

  async getChatBacklog(code: string): Promise<WatchPartyChatMessage[]> {
    const raw = await this.redis.lrange(chatKey(code), 0, -1);
    return raw.map((v) => JSON.parse(v) as WatchPartyChatMessage).reverse();
  }

  async codeExists(code: string): Promise<boolean> {
    return (await this.redis.exists(sessionKey(code))) === 1;
  }

  private async touch(code: string): Promise<void> {
    const keys = allKeys(code);
    const pipeline = this.redis.multi();
    for (const key of keys) {
      pipeline.expire(key, SESSION_TTL_SECONDS);
    }
    await pipeline.exec();
  }
}
