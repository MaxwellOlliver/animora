import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/roles.decorator';

import { SetEpisodeTimestampsDto } from './dto/set-episode-timestamps.dto';
import { GetEpisodeTimestampsUseCase } from './use-cases/get-episode-timestamps.use-case';
import { SetEpisodeTimestampsUseCase } from './use-cases/set-episode-timestamps.use-case';

@ApiTags('Admin / Episode Timestamps')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/episodes/:episodeId/timestamps')
export class EpisodeTimestampsAdminController {
  constructor(
    private readonly getEpisodeTimestampsUseCase: GetEpisodeTimestampsUseCase,
    private readonly setEpisodeTimestampsUseCase: SetEpisodeTimestampsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get timestamp segments for an episode' })
  get(@Param('episodeId', ParseUUIDPipe) episodeId: string) {
    return this.getEpisodeTimestampsUseCase.execute(episodeId);
  }

  @Put()
  @ApiOperation({ summary: 'Replace timestamp segments for an episode' })
  set(
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @Body() dto: SetEpisodeTimestampsDto,
  ) {
    return this.setEpisodeTimestampsUseCase.execute({
      episodeId,
      timestamps: dto.timestamps,
    });
  }
}
