import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';

import { GetRecommendedUseCase } from './use-cases/get-recommended.use-case';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly getRecommendedUseCase: GetRecommendedUseCase) {}

  @Get('recommended')
  @Public()
  @ApiOperation({ summary: 'Get recommended series' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  recommended(
    @Query('cursor', new ParseUUIDPipe({ optional: true })) cursor?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.getRecommendedUseCase.execute({ cursor, limit });
  }
}
