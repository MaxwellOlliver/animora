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
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { CreateEpisodeUseCase } from './use-cases/create-episode.use-case';
import { GetEpisodesUseCase } from './use-cases/get-episodes.use-case';
import { GetEpisodeUseCase } from './use-cases/get-episode.use-case';
import { UpdateEpisodeUseCase } from './use-cases/update-episode.use-case';
import { DeleteEpisodeUseCase } from './use-cases/delete-episode.use-case';
import { UploadEpisodeThumbnailUseCase } from './use-cases/upload-episode-thumbnail.use-case';

@ApiTags('Admin / Episodes')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/episodes')
export class EpisodesAdminController {
  constructor(
    private readonly createEpisodeUseCase: CreateEpisodeUseCase,
    private readonly getEpisodesUseCase: GetEpisodesUseCase,
    private readonly getEpisodeUseCase: GetEpisodeUseCase,
    private readonly updateEpisodeUseCase: UpdateEpisodeUseCase,
    private readonly deleteEpisodeUseCase: DeleteEpisodeUseCase,
    private readonly uploadEpisodeThumbnailUseCase: UploadEpisodeThumbnailUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List episodes for a playlist' })
  @ApiQuery({ name: 'playlistId', required: true, type: String })
  list(@Query('playlistId', ParseUUIDPipe) playlistId: string) {
    return this.getEpisodesUseCase.execute(playlistId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an episode' })
  create(@Body() dto: CreateEpisodeDto) {
    return this.createEpisodeUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an episode by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getEpisodeUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an episode' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEpisodeDto,
  ) {
    return this.updateEpisodeUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an episode' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteEpisodeUseCase.execute(id);
  }

  @Post(':id/thumbnail')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload episode thumbnail' })
  async uploadThumbnail(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    return this.uploadEpisodeThumbnailUseCase.execute(id, file!);
  }
}
