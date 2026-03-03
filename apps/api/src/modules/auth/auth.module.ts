import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ProfilesModule } from '../profiles/profiles.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { RefreshTokenRepository } from './refresh-token.repository';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleAuthUseCase } from './use-cases/google-auth.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';

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
