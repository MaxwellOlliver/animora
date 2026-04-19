export interface WatchPartySession {
  id: string;
  code: string;
  episodeId: string;
  ownerProfileId: string;
  createdAt: number;
  locked: boolean;
}

export interface WatchPartyMember {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  joinedAt: number;
}

export interface WatchPartyChatMessage {
  id: string;
  profileId: string;
  displayName: string;
  content: string;
  at: number;
}

export interface WatchPartySystemMessage {
  id: string;
  kind: "system";
  content: string;
  at: number;
}

export type WatchPartyFeedItem =
  | ({ kind: "chat" } & WatchPartyChatMessage)
  | WatchPartySystemMessage;

export interface WatchPartyPlaybackSnapshot {
  playing: boolean;
  position: number;
  sentAt: number;
}

export interface WatchPartySnapshot {
  session: WatchPartySession;
  members: WatchPartyMember[];
  playback: WatchPartyPlaybackSnapshot;
  chatBacklog: WatchPartyChatMessage[];
}

export interface PlaybackStateBroadcast {
  playing: boolean;
  position: number;
  actorProfileId: string;
  sentAt: number;
}

export const WP_CLIENT_EVENTS = {
  CHAT_SEND: "chat:send",
  PLAYBACK_PLAY: "playback:play",
  PLAYBACK_PAUSE: "playback:pause",
  PLAYBACK_SEEK: "playback:seek",
  MEMBER_KICK: "member:kick",
} as const;

export const WP_SERVER_EVENTS = {
  SESSION_SNAPSHOT: "session:snapshot",
  SESSION_CLOSED: "session:closed",
  SESSION_OWNER_CHANGED: "session:ownerChanged",
  MEMBER_JOINED: "member:joined",
  MEMBER_LEFT: "member:left",
  MEMBER_KICKED: "member:kicked",
  CHAT_NEW: "chat:new",
  PLAYBACK_STATE: "playback:state",
  ERROR: "wp:error",
} as const;
