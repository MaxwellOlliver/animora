import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';
import { LoginUseCase } from './use-cases/login.use-case.js';
import { GoogleAuthUseCase } from './use-cases/google-auth.use-case.js';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case.js';
import { LogoutUseCase } from './use-cases/logout.use-case.js';
import { CreateUserUseCase } from '../users/use-cases/create-user.use-case.js';
import { CreateProfileUseCase } from '../profiles/use-cases/create-profile.use-case.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './strategies/jwt.strategy.js';
import type { JwtRefreshPayload } from './strategies/jwt-refresh.strategy.js';
import type { GoogleProfile } from './strategies/google.strategy.js';
import type { User } from '../users/user.entity.js';

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
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
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
  async googleAuthCallback(@Req() req: { user: GoogleProfile }) {
    return this.googleAuthUseCase.execute(req.user);
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
