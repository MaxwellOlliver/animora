import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../refresh-token.repository.js';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteAllByUserId(userId);
  }
}
