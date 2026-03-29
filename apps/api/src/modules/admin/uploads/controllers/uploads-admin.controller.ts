import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
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

import { CompleteUploadUseCase } from '../use-cases/complete-upload.use-case';
import { UploadChunkUseCase } from '../use-cases/upload-chunk.use-case';

@ApiTags('Admin / Uploads')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/uploads')
export class UploadsAdminController {
  constructor(
    private readonly uploadChunkUseCase: UploadChunkUseCase,
    private readonly completeUploadUseCase: CompleteUploadUseCase,
  ) {}

  @Post(':uploadId/chunk/:index')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single chunk' })
  async uploadChunk(
    @Param('uploadId', ParseUUIDPipe) uploadId: string,
    @Param('index', ParseIntPipe) index: number,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    if (!file) throw new BadRequestException('No file provided');
    return this.uploadChunkUseCase.execute(uploadId, index, file);
  }

  @Post(':uploadId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalize the upload and trigger processing' })
  complete(@Param('uploadId', ParseUUIDPipe) uploadId: string) {
    return this.completeUploadUseCase.execute(uploadId);
  }
}
