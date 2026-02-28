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
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileUseCase } from './use-cases/create-profile.use-case';
import { GetProfilesUseCase } from './use-cases/get-profiles.use-case';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { DeleteProfileUseCase } from './use-cases/delete-profile.use-case';

@ApiTags('Profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly createProfileUseCase: CreateProfileUseCase,
    private readonly getProfilesUseCase: GetProfilesUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly deleteProfileUseCase: DeleteProfileUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List current user profiles' })
  async list(@CurrentUser() user: JwtPayload) {
    return this.getProfilesUseCase.execute(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new profile' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProfileDto) {
    return this.createProfileUseCase.execute({
      userId: user.sub,
      name: dto.name,
      avatarId: dto.avatarId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a profile by ID' })
  async get(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getProfileUseCase.execute({ userId: user.sub, profileId: id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a profile' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute({
      userId: user.sub,
      profileId: id,
      data: dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a profile' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteProfileUseCase.execute({
      userId: user.sub,
      profileId: id,
    });
  }
}
