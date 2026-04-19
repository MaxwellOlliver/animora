import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { EpisodesRepository } from '@/modules/admin/episodes/episodes.repository';

import type { WatchPartySession } from '../types/session.types';
import { WatchPartyRepository } from '../watch-party.repository';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const MAX_CODE_ATTEMPTS = 10;

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

@Injectable()
export class CreateSessionUseCase {
  constructor(
    private readonly repository: WatchPartyRepository,
    private readonly episodesRepository: EpisodesRepository,
  ) {}

  async execute(input: {
    ownerProfileId: string;
    episodeId: string;
  }): Promise<WatchPartySession> {
    const episode = await this.episodesRepository.findById(input.episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    let code = generateCode();
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      if (!(await this.repository.codeExists(code))) break;
      code = generateCode();
    }

    const session: WatchPartySession = {
      id: randomUUID(),
      code,
      episodeId: input.episodeId,
      ownerProfileId: input.ownerProfileId,
      createdAt: Date.now(),
      locked: false,
    };

    await this.repository.createSession(session);
    return session;
  }
}
