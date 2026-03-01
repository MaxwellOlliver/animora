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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Roles } from '@/common/decorators/roles.decorator';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { CreatePlaylistUseCase } from './use-cases/create-playlist.use-case';
import { GetPlaylistsUseCase } from './use-cases/get-playlists.use-case';
import { GetPlaylistUseCase } from './use-cases/get-playlist.use-case';
import { UpdatePlaylistUseCase } from './use-cases/update-playlist.use-case';
import { DeletePlaylistUseCase } from './use-cases/delete-playlist.use-case';
import { UploadPlaylistCoverUseCase } from './use-cases/upload-playlist-cover.use-case';

@ApiTags('Admin / Playlists')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/playlists')
export class PlaylistsAdminController {
  constructor(
    private readonly createPlaylistUseCase: CreatePlaylistUseCase,
    private readonly getPlaylistsUseCase: GetPlaylistsUseCase,
    private readonly getPlaylistUseCase: GetPlaylistUseCase,
    private readonly updatePlaylistUseCase: UpdatePlaylistUseCase,
    private readonly deletePlaylistUseCase: DeletePlaylistUseCase,
    private readonly uploadPlaylistCoverUseCase: UploadPlaylistCoverUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List playlists for a series' })
  @ApiQuery({ name: 'seriesId', required: true, type: String })
  list(@Query('seriesId', ParseUUIDPipe) seriesId: string) {
    return this.getPlaylistsUseCase.execute(seriesId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a playlist' })
  create(@Body() dto: CreatePlaylistDto) {
    return this.createPlaylistUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a playlist by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getPlaylistUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a playlist' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlaylistDto) {
    return this.updatePlaylistUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a playlist' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deletePlaylistUseCase.execute(id);
  }

  @Post(':id/cover')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload playlist cover image' })
  async uploadCover(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    return this.uploadPlaylistCoverUseCase.execute(id, file!);
  }
}
