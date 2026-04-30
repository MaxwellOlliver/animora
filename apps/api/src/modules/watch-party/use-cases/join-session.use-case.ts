import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { ProfileWithAvatar } from '@/modules/profiles/profiles.repository';

import type { WatchPartyMember } from '../types/session.types';
import { WatchPartyRepository } from '../watch-party.repository';
import { GetSessionSnapshotUseCase } from './get-session-snapshot.use-case';

@Injectable()
export class JoinSessionUseCase {
  constructor(
    private readonly repository: WatchPartyRepository,
    private readonly getSnapshot: GetSessionSnapshotUseCase,
  ) {}

  async execute(input: { code: string; profile: ProfileWithAvatar }) {
    const session = await this.repository.findSession(input.code);
    if (!session) {
      throw new NotFoundException('Watch party not found');
    }

    if (await this.repository.isBanned(input.code, input.profile.id)) {
      throw new ForbiddenException('You are banned from this watch party');
    }

    const existing = await this.repository.findMember(
      input.code,
      input.profile.id,
    );

    if (!existing) {
      const member: WatchPartyMember = {
        profileId: input.profile.id,
        displayName: input.profile.name,
        avatar: input.profile.avatar?.picture ?? null,
        joinedAt: Date.now(),
      };
      await this.repository.addMember(input.code, member);
    }

    return this.getSnapshot.execute({ code: input.code });
  }
}
