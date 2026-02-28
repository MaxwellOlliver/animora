import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { LoginUseCase } from './use-cases/login.use-case.js';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case.js';
import { GoogleAuthUseCase } from './use-cases/google-auth.use-case.js';
import { LogoutUseCase } from './use-cases/logout.use-case.js';
import { RefreshTokenRepository } from './refresh-token.repository.js';

@Module({
  imports: [
    UsersModule,
    ProfilesModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow(
            'JWT_EXPIRATION',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    GoogleStrategy,
    RefreshTokenRepository,
    LoginUseCase,
    RefreshTokenUseCase,
    GoogleAuthUseCase,
    LogoutUseCase,
  ],
})
export class AuthModule {}
