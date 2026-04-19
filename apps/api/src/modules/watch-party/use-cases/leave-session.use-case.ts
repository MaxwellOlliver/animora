import { Injectable } from '@nestjs/common';

import type { WatchPartyMember } from '../types/session.types';
import { WatchPartyRepository } from '../watch-party.repository';

export interface LeaveSessionResult {
  sessionDeleted: boolean;
  newOwnerProfileId: string | null;
}

@Injectable()
export class LeaveSessionUseCase {
  constructor(private readonly repository: WatchPartyRepository) {}

  async execute(input: {
    code: string;
    profileId: string;
  }): Promise<LeaveSessionResult> {
    const session = await this.repository.findSession(input.code);
    if (!session) {
      return { sessionDeleted: false, newOwnerProfileId: null };
    }

    await this.repository.removeMember(input.code, input.profileId);
    const remaining = await this.repository.listMembers(input.code);

    if (remaining.length === 0) {
      await this.repository.deleteSession(input.code);
      return { sessionDeleted: true, newOwnerProfileId: null };
    }

    if (session.ownerProfileId === input.profileId) {
      const next = pickOldest(remaining);
      await this.repository.setOwner(input.code, next.profileId);
      return { sessionDeleted: false, newOwnerProfileId: next.profileId };
    }

    return { sessionDeleted: false, newOwnerProfileId: null };
  }
}

function pickOldest(members: WatchPartyMember[]): WatchPartyMember {
  return members.reduce((oldest, m) =>
    m.joinedAt < oldest.joinedAt ? m : oldest,
  );
}
