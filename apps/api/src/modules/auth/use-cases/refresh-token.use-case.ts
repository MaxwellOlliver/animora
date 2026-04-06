import { getLogger } from '@animora/logger';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersRepository } from '../../users/users.repository';
import { RefreshTokenRepository } from '../refresh-token.repository';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = getLogger({ appName: 'animora@api' }).child({
    scope: 'auth-refresh',
  });

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(userId: string, jti: string) {
    this.logger.info('refresh-started', {
      jtiSuffix: this.getSuffix(jti),
      userId,
    });

    const stored = await this.refreshTokenRepository.findByJti(jti);

    if (!stored) {
      this.logger.warn('refresh-denied', {
        jtiSuffix: this.getSuffix(jti),
        reason: 'missing-token',
        userId,
      });
      throw new ForbiddenException('Access denied');
    }

    if (stored.userId !== userId) {
      this.logger.warn('refresh-denied', {
        jtiSuffix: this.getSuffix(jti),
        reason: 'user-mismatch',
        storedUserId: stored.userId,
        userId,
      });
      throw new ForbiddenException('Access denied');
    }

    if (stored.expiresAt < new Date()) {
      this.logger.warn('refresh-denied', {
        expiresAt: stored.expiresAt.toISOString(),
        jtiSuffix: this.getSuffix(jti),
        reason: 'expired-token',
        userId,
      });
      throw new ForbiddenException('Access denied');
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      this.logger.warn('refresh-denied', {
        jtiSuffix: this.getSuffix(jti),
        reason: 'missing-user',
        userId,
      });
      throw new ForbiddenException('Access denied');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.info('refresh-succeeded', {
      jtiSuffix: this.getSuffix(jti),
      userId: user.id,
    });

    return { accessToken };
  }

  private getSuffix(value: string): string {
    return value.slice(-8);
  }
}
