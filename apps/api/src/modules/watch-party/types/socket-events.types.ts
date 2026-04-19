import type {
  WatchPartyChatMessage,
  WatchPartyMember,
  WatchPartySnapshot,
} from './session.types';

export const WP_CLIENT_EVENTS = {
  CHAT_SEND: 'chat:send',
  PLAYBACK_PLAY: 'playback:play',
  PLAYBACK_PAUSE: 'playback:pause',
  PLAYBACK_SEEK: 'playback:seek',
  MEMBER_KICK: 'member:kick',
} as const;

export const WP_SERVER_EVENTS = {
  SESSION_SNAPSHOT: 'session:snapshot',
  SESSION_CLOSED: 'session:closed',
  SESSION_OWNER_CHANGED: 'session:ownerChanged',
  MEMBER_JOINED: 'member:joined',
  MEMBER_LEFT: 'member:left',
  MEMBER_KICKED: 'member:kicked',
  CHAT_NEW: 'chat:new',
  PLAYBACK_STATE: 'playback:state',
  ERROR: 'wp:error',
} as const;

export interface ChatSendPayload {
  content: string;
}

export interface PlaybackSeekPayload {
  position: number;
}

export interface MemberKickPayload {
  profileId: string;
}

export interface PlaybackStateBroadcast {
  playing: boolean;
  position: number;
  actorProfileId: string;
  sentAt: number;
}

export type SessionSnapshotPayload = WatchPartySnapshot;
export type MemberJoinedPayload = WatchPartyMember;
export interface MemberLeftPayload {
  profileId: string;
}
export interface MemberKickedPayload {
  profileId: string;
  byProfileId: string;
}
export type ChatNewPayload = WatchPartyChatMessage;
export interface SessionOwnerChangedPayload {
  ownerProfileId: string;
}
export interface SessionClosedPayload {
  reason: 'empty' | 'kicked' | 'owner-left';
}
