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
import { CreateContentClassificationDto } from './dto/create-content-classification.dto';
import { UpdateContentClassificationDto } from './dto/update-content-classification.dto';
import { CreateContentClassificationUseCase } from './use-cases/create-content-classification.use-case';
import { GetContentClassificationsUseCase } from './use-cases/get-content-classifications.use-case';
import { GetContentClassificationUseCase } from './use-cases/get-content-classification.use-case';
import { UpdateContentClassificationUseCase } from './use-cases/update-content-classification.use-case';
import { DeleteContentClassificationUseCase } from './use-cases/delete-content-classification.use-case';
import { UploadContentClassificationIconUseCase } from './use-cases/upload-content-classification-icon.use-case';

@ApiTags('Admin / Content Classifications')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/content-classifications')
export class ContentClassificationsAdminController {
  constructor(
    private readonly createUseCase: CreateContentClassificationUseCase,
    private readonly getAllUseCase: GetContentClassificationsUseCase,
    private readonly getOneUseCase: GetContentClassificationUseCase,
    private readonly updateUseCase: UpdateContentClassificationUseCase,
    private readonly deleteUseCase: DeleteContentClassificationUseCase,
    private readonly uploadIconUseCase: UploadContentClassificationIconUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all content classifications' })
  list() {
    return this.getAllUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Create a content classification' })
  create(@Body() dto: CreateContentClassificationDto) {
    return this.createUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a content classification by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getOneUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a content classification' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContentClassificationDto,
  ) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a content classification' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUseCase.execute(id);
  }

  @Post(':id/icon')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload content classification icon' })
  async uploadIcon(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    return this.uploadIconUseCase.execute(id, file!);
  }
}
