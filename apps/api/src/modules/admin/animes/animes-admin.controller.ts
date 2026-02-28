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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Roles } from '@/common/decorators/roles.decorator';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { CreateAnimeUseCase } from './use-cases/create-anime.use-case';
import { GetAnimesUseCase } from './use-cases/get-animes.use-case';
import { GetAnimeUseCase } from './use-cases/get-anime.use-case';
import { UpdateAnimeUseCase } from './use-cases/update-anime.use-case';
import { DeleteAnimeUseCase } from './use-cases/delete-anime.use-case';
import { UploadAnimeBannerUseCase } from './use-cases/upload-anime-banner.use-case';

@ApiTags('Admin / Animes')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/animes')
export class AnimesAdminController {
  constructor(
    private readonly createAnimeUseCase: CreateAnimeUseCase,
    private readonly getAnimesUseCase: GetAnimesUseCase,
    private readonly getAnimeUseCase: GetAnimeUseCase,
    private readonly updateAnimeUseCase: UpdateAnimeUseCase,
    private readonly deleteAnimeUseCase: DeleteAnimeUseCase,
    private readonly uploadAnimeBannerUseCase: UploadAnimeBannerUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all animes' })
  list() {
    return this.getAnimesUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Create an anime' })
  create(@Body() dto: CreateAnimeDto) {
    return this.createAnimeUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an anime by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAnimeUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an anime' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAnimeDto) {
    return this.updateAnimeUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an anime' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteAnimeUseCase.execute(id);
  }

  @Post(':id/banner')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload anime banner image' })
  async uploadBanner(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    return this.uploadAnimeBannerUseCase.execute(id, file!);
  }
}
