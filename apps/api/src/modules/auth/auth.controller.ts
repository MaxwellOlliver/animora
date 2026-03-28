import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

import { CreateProfileUseCase } from '../profiles/use-cases/create-profile.use-case';
import { CreateUserUseCase } from '../users/use-cases/create-user.use-case';
import type { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { GoogleProfile } from './strategies/google.strategy';
import type { JwtPayload } from './strategies/jwt.strategy';
import type { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';
import { GoogleAuthUseCase } from './use-cases/google-auth.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly googleAuthUseCase: GoogleAuthUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createProfileUseCase: CreateProfileUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    // TODO: Replace with a single use case that handles both user and profile creation in a transaction
    const user = await this.createUserUseCase.execute(dto);
    await this.createProfileUseCase.execute({
      userId: user.id,
      name: dto.name,
    });
    return this.loginUseCase.execute(user);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  async login(@Req() req: { user: User }) {
    return this.loginUseCase.execute(req.user);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(
    @Req() req: { user: GoogleProfile },
    @Res() res: FastifyReply,
  ) {
    const { accessToken, refreshToken } = await this.googleAuthUseCase.execute(
      req.user,
    );

    const webUrl = this.configService.getOrThrow<string>('WEB_URL');
    const callback = new URL('/api/auth/google/callback', webUrl);
    callback.searchParams.set('accessToken', accessToken);
    callback.searchParams.set('refreshToken', refreshToken);

    res.status(302).redirect(callback.toString());
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: { user: JwtRefreshPayload }) {
    return this.refreshTokenUseCase.execute(req.user.sub, req.user.jti);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@CurrentUser() user: JwtPayload) {
    await this.logoutUseCase.execute(user.sub);
  }
}
