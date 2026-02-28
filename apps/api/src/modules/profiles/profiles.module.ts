import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller.js';
import { ProfilesRepository } from './profiles.repository.js';
import { AvatarsRepository } from '../admin/avatars/avatars.repository.js';
import { CreateProfileUseCase } from './use-cases/create-profile.use-case.js';
import { GetProfilesUseCase } from './use-cases/get-profiles.use-case.js';
import { GetProfileUseCase } from './use-cases/get-profile.use-case.js';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case.js';
import { DeleteProfileUseCase } from './use-cases/delete-profile.use-case.js';

@Module({
  controllers: [ProfilesController],
  providers: [
    ProfilesRepository,
    AvatarsRepository,
    CreateProfileUseCase,
    GetProfilesUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
    DeleteProfileUseCase,
  ],
  exports: [CreateProfileUseCase],
})
export class ProfilesModule {}
