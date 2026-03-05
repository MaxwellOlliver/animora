import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';

import { Roles } from '@/common/decorators/roles.decorator';

import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { CreateAvatarUseCase } from './use-cases/create-avatar.use-case';
import { DeleteAvatarUseCase } from './use-cases/delete-avatar.use-case';
import { GetAvatarUseCase } from './use-cases/get-avatar.use-case';
import { GetAvatarsUseCase } from './use-cases/get-avatars.use-case';
import { UpdateAvatarUseCase } from './use-cases/update-avatar.use-case';
import { UpdateAvatarBannerUseCase } from './use-cases/update-avatar-banner.use-case';

@ApiTags('Admin / Avatars')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/avatars')
export class AvatarsAdminController {
  constructor(
    private readonly createAvatarUseCase: CreateAvatarUseCase,
    private readonly getAvatarsUseCase: GetAvatarsUseCase,
    private readonly getAvatarUseCase: GetAvatarUseCase,
    private readonly updateAvatarUseCase: UpdateAvatarUseCase,
    private readonly updateAvatarBannerUseCase: UpdateAvatarBannerUseCase,
    private readonly deleteAvatarUseCase: DeleteAvatarUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all avatars' })
  list() {
    return this.getAvatarsUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Create an avatar' })
  create(@Body() dto: CreateAvatarDto) {
    return this.createAvatarUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an avatar by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAvatarUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an avatar' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAvatarDto) {
    return this.updateAvatarUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an avatar' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteAvatarUseCase.execute(id);
  }

  @Post(':id/banner')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload avatar banner image' })
  async uploadBanner(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    return this.updateAvatarBannerUseCase.execute(id, file!);
  }
}
