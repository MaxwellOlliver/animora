import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { WatchPartyPlaybackState } from '../types/session.types';
import { WatchPartyRepository } from '../watch-party.repository';

export type PlaybackEvent =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'seek'; position: number };

export interface PlaybackBroadcast {
  playing: boolean;
  position: number;
  actorProfileId: string;
  sentAt: number;
}

@Injectable()
export class ApplyPlaybackEventUseCase {
  constructor(private readonly repository: WatchPartyRepository) {}

  async execute(input: {
    code: string;
    actorProfileId: string;
    event: PlaybackEvent;
  }): Promise<PlaybackBroadcast> {
    const session = await this.repository.findSession(input.code);
    if (!session) {
      throw new NotFoundException('Watch party not found');
    }

    if (session.locked && session.ownerProfileId !== input.actorProfileId) {
      throw new ForbiddenException('Playback is locked by the owner');
    }

    const member = await this.repository.findMember(
      input.code,
      input.actorProfileId,
    );
    if (!member) {
      throw new ForbiddenException('Not a member of this watch party');
    }

    const current = (await this.repository.getPlayback(input.code)) ?? {
      playing: false,
      anchorPosition: 0,
      anchorAt: Date.now(),
    };

    const now = Date.now();
    const next = reduce(current, input.event, now);

    await this.repository.setPlayback(input.code, next);

    return {
      playing: next.playing,
      position: next.anchorPosition,
      actorProfileId: input.actorProfileId,
      sentAt: now,
    };
  }
}

function reduce(
  state: WatchPartyPlaybackState,
  event: PlaybackEvent,
  now: number,
): WatchPartyPlaybackState {
  switch (event.type) {
    case 'play':
      if (state.playing) return state;
      return {
        playing: true,
        anchorPosition: state.anchorPosition,
        anchorAt: now,
      };
    case 'pause': {
      const frozen = state.playing
        ? state.anchorPosition + (now - state.anchorAt)
        : state.anchorPosition;
      return { playing: false, anchorPosition: frozen, anchorAt: now };
    }
    case 'seek':
      return {
        playing: state.playing,
        anchorPosition: Math.max(0, event.position),
        anchorAt: now,
      };
  }
}
