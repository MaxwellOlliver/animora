import { Module } from '@nestjs/common';

import { AvatarsModule } from '../admin/avatars/avatars.module';
import { ProfilesController } from './profiles.controller';
import { ProfilesRepository } from './profiles.repository';
import { CreateProfileUseCase } from './use-cases/create-profile.use-case';
import { DeleteProfileUseCase } from './use-cases/delete-profile.use-case';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { GetProfilesUseCase } from './use-cases/get-profiles.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';

@Module({
  imports: [AvatarsModule],
  controllers: [ProfilesController],
  providers: [
    ProfilesRepository,
    CreateProfileUseCase,
    GetProfilesUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
    DeleteProfileUseCase,
  ],
  exports: [ProfilesRepository, CreateProfileUseCase],
})
export class ProfilesModule {}
