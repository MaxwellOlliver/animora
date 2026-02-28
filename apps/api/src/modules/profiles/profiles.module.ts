import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesRepository } from './profiles.repository';
import { AvatarsRepository } from '../admin/avatars/avatars.repository';
import { CreateProfileUseCase } from './use-cases/create-profile.use-case';
import { GetProfilesUseCase } from './use-cases/get-profiles.use-case';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { DeleteProfileUseCase } from './use-cases/delete-profile.use-case';

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
