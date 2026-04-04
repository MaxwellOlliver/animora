import { getLogger } from '@animora/logger';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

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
    private readonly config: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(userId: string, jti: string) {
    this.logger.info('rotation-started', {
      jtiSuffix: this.getSuffix(jti),
      userId,
    });

    const stored = await this.refreshTokenRepository.findByJti(jti);

    if (!stored) {
      this.logger.warn('rotation-denied', {
        jtiSuffix: this.getSuffix(jti),
        reason: 'missing-token',
        userId,
      });
      throw new ForbiddenException('Access denied');
    }

    if (stored.userId !== userId) {
      this.logger.warn('rotation-denied', {
        jtiSuffix: this.getSuffix(jti),
        reason: 'user-mismatch',
        storedUserId: stored.userId,
        userId,
      });
      throw new ForbiddenException('Access denied');
    }

    if (stored.expiresAt < new Date()) {
      this.logger.warn('rotation-denied', {
        expiresAt: stored.expiresAt.toISOString(),
        jtiSuffix: this.getSuffix(jti),
        reason: 'expired-token',
        userId,
      });
      throw new ForbiddenException('Access denied');
    }

    await this.refreshTokenRepository.deleteByJti(jti);
    this.logger.info('rotation-revoked-old-token', {
      jtiSuffix: this.getSuffix(jti),
      userId,
    });

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      this.logger.warn('rotation-denied', {
        jtiSuffix: this.getSuffix(jti),
        reason: 'missing-user',
        userId,
      });
      throw new ForbiddenException('Access denied');
    }

    const newJti = randomUUID();
    const refreshExpiration = this.config.getOrThrow<string>(
      'JWT_REFRESH_EXPIRATION',
    );

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshOptions: JwtSignOptions = {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiration as JwtSignOptions['expiresIn'],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync({ ...payload, jti: newJti }, refreshOptions),
    ]);

    await this.refreshTokenRepository.create({
      jti: newJti,
      userId: user.id,
      expiresAt: new Date(Date.now() + this.parseExpiration(refreshExpiration)),
    });

    this.logger.info('rotation-succeeded', {
      newJtiSuffix: this.getSuffix(newJti),
      previousJtiSuffix: this.getSuffix(jti),
      userId: user.id,
    });

    return { accessToken, refreshToken };
  }

  private parseExpiration(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const num = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return num * multipliers[unit];
  }

  private getSuffix(value: string): string {
    return value.slice(-8);
  }
}
