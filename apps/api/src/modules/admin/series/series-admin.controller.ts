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
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { CreateSeriesUseCase } from './use-cases/create-series.use-case';
import { GetSeriesUseCase } from './use-cases/get-series.use-case';
import { GetSeriesByIdUseCase } from './use-cases/get-series-by-id.use-case';
import { UpdateSeriesUseCase } from './use-cases/update-series.use-case';
import { DeleteSeriesUseCase } from './use-cases/delete-series.use-case';
import { UploadSeriesBannerUseCase } from './use-cases/upload-series-banner.use-case';

@ApiTags('Admin / Series')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/series')
export class SeriesAdminController {
  constructor(
    private readonly createSeriesUseCase: CreateSeriesUseCase,
    private readonly getSeriesUseCase: GetSeriesUseCase,
    private readonly getSeriesByIdUseCase: GetSeriesByIdUseCase,
    private readonly updateSeriesUseCase: UpdateSeriesUseCase,
    private readonly deleteSeriesUseCase: DeleteSeriesUseCase,
    private readonly uploadSeriesBannerUseCase: UploadSeriesBannerUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all series' })
  list() {
    return this.getSeriesUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Create a series' })
  create(@Body() dto: CreateSeriesDto) {
    return this.createSeriesUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a series by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getSeriesByIdUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a series' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSeriesDto) {
    return this.updateSeriesUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a series' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteSeriesUseCase.execute(id);
  }

  @Post(':id/banner')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload series banner image' })
  async uploadBanner(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    return this.uploadSeriesBannerUseCase.execute(id, file!);
  }
}
