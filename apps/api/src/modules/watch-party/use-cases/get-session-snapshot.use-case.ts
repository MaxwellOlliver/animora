import { Injectable, NotFoundException } from '@nestjs/common';

import type {
  WatchPartyPlaybackState,
  WatchPartySnapshot,
} from '../types/session.types';
import { WatchPartyRepository } from '../watch-party.repository';

export function computePosition(
  state: WatchPartyPlaybackState,
  now: number,
): number {
  if (!state.playing) return state.anchorPosition;
  return state.anchorPosition + (now - state.anchorAt);
}

@Injectable()
export class GetSessionSnapshotUseCase {
  constructor(private readonly repository: WatchPartyRepository) {}

  async execute(input: { code: string }): Promise<WatchPartySnapshot> {
    const session = await this.repository.findSession(input.code);
    if (!session) {
      throw new NotFoundException('Watch party not found');
    }

    const [playback, members, chatBacklog] = await Promise.all([
      this.repository.getPlayback(input.code),
      this.repository.listMembers(input.code),
      this.repository.getChatBacklog(input.code),
    ]);

    const now = Date.now();
    const playbackState = playback ?? {
      playing: false,
      anchorPosition: 0,
      anchorAt: now,
    };

    return {
      session,
      members,
      playback: {
        playing: playbackState.playing,
        position: computePosition(playbackState, now),
        sentAt: now,
      },
      chatBacklog,
    };
  }
}
