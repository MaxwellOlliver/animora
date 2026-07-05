import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import type { WatchPartyChatMessage } from '../types/session.types';
import { WatchPartyRepository } from '../watch-party.repository';

@Injectable()
export class PostChatMessageUseCase {
  constructor(private readonly repository: WatchPartyRepository) {}

  async execute(input: {
    code: string;
    profileId: string;
    content: string;
  }): Promise<WatchPartyChatMessage> {
    const member = await this.repository.findMember(
      input.code,
      input.profileId,
    );
    if (!member) {
      throw new ForbiddenException('Not a member of this watch party');
    }

    const session = await this.repository.findSession(input.code);
    if (!session) {
      throw new NotFoundException('Watch party not found');
    }

    const message: WatchPartyChatMessage = {
      id: randomUUID(),
      profileId: input.profileId,
      displayName: member.displayName,
      content: input.content,
      at: Date.now(),
    };

    await this.repository.pushChatMessage(input.code, message);
    return message;
  }
}
