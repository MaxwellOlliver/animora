import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { GetUserUseCase } from './use-cases/get-user.use-case';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.getUserUseCase.execute(user.sub);
  }
}
