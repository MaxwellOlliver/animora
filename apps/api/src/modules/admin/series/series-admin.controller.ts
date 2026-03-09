import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';

import { Roles } from '@/common/decorators/roles.decorator';

import { CreateSeriesDto } from './dto/create-series.dto';
import {
  SERIES_ASSET_PURPOSES,
  type SeriesAssetPurpose,
} from './dto/series-asset.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { ParseAssetPurposePipe } from './pipes/parse-asset-purpose.pipe';
import { CreateSeriesUseCase } from './use-cases/create-series.use-case';
import { DeleteSeriesUseCase } from './use-cases/delete-series.use-case';
import { GetSeriesUseCase } from './use-cases/get-series.use-case';
import { GetSeriesByIdUseCase } from './use-cases/get-series-by-id.use-case';
import { UpdateSeriesUseCase } from './use-cases/update-series.use-case';
import { UpsertSeriesAssetUseCase } from './use-cases/upsert-series-asset.use-case';

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
    private readonly upsertSeriesAssetUseCase: UpsertSeriesAssetUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List series (cursor paginated)' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  list(
    @Query('cursor', new ParseUUIDPipe({ optional: true })) cursor?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.getSeriesUseCase.execute({ cursor, limit });
  }

  @Post()
  @ApiOperation({ summary: 'Create a series (created as inactive)' })
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

  @Post(':id/assets/:purpose')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload or replace a series asset' })
  @ApiParam({
    name: 'purpose',
    enum: SERIES_ASSET_PURPOSES,
  })
  async upsertAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('purpose', ParseAssetPurposePipe) purpose: SeriesAssetPurpose,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    return this.upsertSeriesAssetUseCase.execute(id, purpose, file!);
  }
}
