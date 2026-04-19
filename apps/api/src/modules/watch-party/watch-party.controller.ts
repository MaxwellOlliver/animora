import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActiveProfile } from '@/common/decorators/active-profile.decorator';
import { ActiveProfileGuard } from '@/common/guards/active-profile.guard';
import type { ProfileWithAvatar } from '@/modules/profiles/profiles.repository';

import { CreateSessionDto } from './dto/create-session.dto';
import { CreateSessionUseCase } from './use-cases/create-session.use-case';
import { GetSessionSnapshotUseCase } from './use-cases/get-session-snapshot.use-case';
import { JoinSessionUseCase } from './use-cases/join-session.use-case';

@ApiTags('Watch Party')
@ApiBearerAuth()
@Controller('watch-party')
@UseGuards(ActiveProfileGuard)
export class WatchPartyController {
  constructor(
    private readonly createSession: CreateSessionUseCase,
    private readonly joinSession: JoinSessionUseCase,
    private readonly getSnapshot: GetSessionSnapshotUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new watch party session' })
  async create(
    @ActiveProfile() profile: ProfileWithAvatar,
    @Body() dto: CreateSessionDto,
  ) {
    const session = await this.createSession.execute({
      ownerProfileId: profile.id,
      episodeId: dto.episodeId,
    });
    return { session };
  }

  @Post(':code/join')
  @ApiOperation({ summary: 'Join a watch party by code' })
  join(
    @ActiveProfile() profile: ProfileWithAvatar,
    @Param('code') code: string,
  ) {
    return this.joinSession.execute({
      code: code.toUpperCase(),
      profile,
    });
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get watch party snapshot' })
  get(@Param('code') code: string) {
    return this.getSnapshot.execute({ code: code.toUpperCase() });
  }
}
