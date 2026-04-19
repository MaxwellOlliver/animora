import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WatchPartyRepository } from '../watch-party.repository';

@Injectable()
export class KickMemberUseCase {
  constructor(private readonly repository: WatchPartyRepository) {}

  async execute(input: {
    code: string;
    actorProfileId: string;
    targetProfileId: string;
  }): Promise<void> {
    const session = await this.repository.findSession(input.code);
    if (!session) {
      throw new NotFoundException('Watch party not found');
    }
    if (session.ownerProfileId !== input.actorProfileId) {
      throw new ForbiddenException('Only the owner can kick members');
    }
    if (input.targetProfileId === input.actorProfileId) {
      throw new BadRequestException('You cannot kick yourself');
    }

    const target = await this.repository.findMember(
      input.code,
      input.targetProfileId,
    );
    if (!target) {
      throw new NotFoundException('Member not in session');
    }

    await this.repository.ban(input.code, input.targetProfileId);
    await this.repository.removeMember(input.code, input.targetProfileId);
  }
}
