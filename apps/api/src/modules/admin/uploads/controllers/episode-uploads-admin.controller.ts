import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/roles.decorator';

import { InitUploadDto } from '../dto/init-upload.dto';
import { InitUploadUseCase } from '../use-cases/init-upload.use-case';

@ApiTags('Admin / Episode Uploads')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/episodes/:id/uploads')
export class EpisodeUploadsAdminController {
  constructor(private readonly initUploadUseCase: InitUploadUseCase) {}

  @Post('init')
  @ApiOperation({ summary: 'Initialize a chunked video upload for an episode' })
  init(@Param('id', ParseUUIDPipe) id: string, @Body() dto: InitUploadDto) {
    return this.initUploadUseCase.execute('episode', id, dto);
  }
}
