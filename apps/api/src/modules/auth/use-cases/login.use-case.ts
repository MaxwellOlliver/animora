import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { RefreshTokenRepository } from '../refresh-token.repository';
import { User } from '../../users/user.entity';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(user: User) {
    const jti = randomUUID();
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
      this.jwtService.signAsync({ ...payload, jti }, refreshOptions),
    ]);

    await this.refreshTokenRepository.create({
      jti,
      userId: user.id,
      expiresAt: new Date(Date.now() + this.parseExpiration(refreshExpiration)),
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
}
