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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { CreateGenreUseCase } from './use-cases/create-genre.use-case';
import { GetGenresUseCase } from './use-cases/get-genres.use-case';
import { GetGenreUseCase } from './use-cases/get-genre.use-case';
import { UpdateGenreUseCase } from './use-cases/update-genre.use-case';
import { DeleteGenreUseCase } from './use-cases/delete-genre.use-case';

@ApiTags('Admin / Genres')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/genres')
export class GenresAdminController {
  constructor(
    private readonly createGenreUseCase: CreateGenreUseCase,
    private readonly getGenresUseCase: GetGenresUseCase,
    private readonly getGenreUseCase: GetGenreUseCase,
    private readonly updateGenreUseCase: UpdateGenreUseCase,
    private readonly deleteGenreUseCase: DeleteGenreUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all genres' })
  list() {
    return this.getGenresUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Create a genre' })
  create(@Body() dto: CreateGenreDto) {
    return this.createGenreUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a genre by ID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getGenreUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a genre' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGenreDto) {
    return this.updateGenreUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a genre' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteGenreUseCase.execute(id);
  }
}
