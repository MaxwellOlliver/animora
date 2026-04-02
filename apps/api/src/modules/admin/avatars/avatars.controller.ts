import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';

import { GetAvatarsUseCase } from './use-cases/get-avatars.use-case';

@Public()
@ApiTags('Avatars')
@Controller('avatars')
export class AvatarsController {
  constructor(private readonly getAvatarsUseCase: GetAvatarsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List active avatars' })
  async list() {
    const avatars = await this.getAvatarsUseCase.execute();
    return avatars.filter((avatar) => avatar.active);
  }
}
