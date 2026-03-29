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
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';

import { Roles } from '@/common/decorators/roles.decorator';

import { GetVideoByOwnerUseCase } from '../videos/use-cases/get-video-by-owner.use-case';
import { CreateTrailerDto } from './dto/create-trailer.dto';
import { UpdateTrailerDto } from './dto/update-trailer.dto';
import { CreateTrailerUseCase } from './use-cases/create-trailer.use-case';
import { DeleteTrailerUseCase } from './use-cases/delete-trailer.use-case';
import { GetTrailerUseCase } from './use-cases/get-trailer.use-case';
import { GetTrailersUseCase } from './use-cases/get-trailers.use-case';
import { UpdateTrailerUseCase } from './use-cases/update-trailer.use-case';
import { UploadTrailerThumbnailUseCase } from './use-cases/upload-trailer-thumbnail.use-case';

@ApiTags('Admin / Trailers')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/trailers')
export class TrailersAdminController {
  constructor(
    private readonly createTrailerUseCase: CreateTrailerUseCase,
    private readonly getTrailersUseCase: GetTrailersUseCase,
    private readonly getTrailerUseCase: GetTrailerUseCase,
    private readonly updateTrailerUseCase: UpdateTrailerUseCase,
    private readonly deleteTrailerUseCase: DeleteTrailerUseCase,
    private readonly uploadTrailerThumbnailUseCase: UploadTrailerThumbnailUseCase,
    private readonly getVideoByOwnerUseCase: GetVideoByOwnerUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List trailers, optionally filtered by series' })
  @ApiQuery({ name: 'seriesId', required: false, type: String })
  list(@Query('seriesId') seriesId?: string) {
    return this.getTrailersUseCase.execute(seriesId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a trailer' })
  create(@Body() dto: CreateTrailerDto) {
    return this.createTrailerUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a trailer by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getTrailerUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a trailer' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrailerDto,
  ) {
    return this.updateTrailerUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a trailer' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteTrailerUseCase.execute(id);
  }

  @Get(':id/video')
  @ApiOperation({ summary: 'Get video for a trailer' })
  async getVideo(@Param('id', ParseUUIDPipe) id: string) {
    return this.getVideoByOwnerUseCase.execute('trailer', id);
  }

  @Post(':id/thumbnail')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload trailer thumbnail' })
  async uploadThumbnail(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    return this.uploadTrailerThumbnailUseCase.execute(id, file!);
  }
}
