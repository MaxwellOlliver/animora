export interface WatchPartySession {
  id: string;
  code: string;
  episodeId: string;
  ownerProfileId: string;
  createdAt: number;
  locked: boolean;
}

export interface WatchPartyAvatar {
  key: string;
  purpose: string;
}

export interface WatchPartyMember {
  profileId: string;
  displayName: string;
  avatar: WatchPartyAvatar | null;
  joinedAt: number;
}

export interface WatchPartyPlaybackState {
  playing: boolean;
  anchorPosition: number;
  anchorAt: number;
}

export interface WatchPartyChatMessage {
  id: string;
  profileId: string;
  displayName: string;
  content: string;
  at: number;
}

export interface WatchPartySnapshot {
  session: WatchPartySession;
  members: WatchPartyMember[];
  playback: {
    playing: boolean;
    position: number;
    sentAt: number;
  };
  chatBacklog: WatchPartyChatMessage[];
}
