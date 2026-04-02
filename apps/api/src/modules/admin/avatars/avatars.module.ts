import { Module } from '@nestjs/common';

import { MediaModule } from '@/modules/media/media.module';

import { AvatarsRepository } from './avatars.repository';
import { AvatarsAdminController } from './avatars-admin.controller';
import { AvatarsController } from './avatars.controller';
import { CreateAvatarUseCase } from './use-cases/create-avatar.use-case';
import { DeleteAvatarUseCase } from './use-cases/delete-avatar.use-case';
import { GetAvatarUseCase } from './use-cases/get-avatar.use-case';
import { GetAvatarsUseCase } from './use-cases/get-avatars.use-case';
import { UpdateAvatarUseCase } from './use-cases/update-avatar.use-case';
import { UpdateAvatarBannerUseCase } from './use-cases/update-avatar-banner.use-case';

@Module({
  imports: [MediaModule],
  controllers: [AvatarsAdminController, AvatarsController],
  providers: [
    AvatarsRepository,
    CreateAvatarUseCase,
    GetAvatarsUseCase,
    GetAvatarUseCase,
    UpdateAvatarUseCase,
    UpdateAvatarBannerUseCase,
    DeleteAvatarUseCase,
  ],
  exports: [AvatarsRepository],
})
export class AvatarsModule {}
