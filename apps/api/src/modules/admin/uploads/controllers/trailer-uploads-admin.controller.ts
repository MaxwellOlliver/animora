import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/roles.decorator';

import { InitUploadDto } from '../dto/init-upload.dto';
import { InitUploadUseCase } from '../use-cases/init-upload.use-case';

@ApiTags('Admin / Trailer Uploads')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/trailers/:id/uploads')
export class TrailerUploadsAdminController {
  constructor(private readonly initUploadUseCase: InitUploadUseCase) {}

  @Post('init')
  @ApiOperation({ summary: 'Initialize a chunked video upload for a trailer' })
  init(@Param('id', ParseUUIDPipe) id: string, @Body() dto: InitUploadDto) {
    return this.initUploadUseCase.execute('trailer', id, dto);
  }
}
