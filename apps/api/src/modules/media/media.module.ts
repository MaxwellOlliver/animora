import { Module } from '@nestjs/common';

import { MediaRepository } from './media.repository';
import { DeleteMediaUseCase } from './use-cases/delete-media.use-case';
import { UploadMediaUseCase } from './use-cases/upload-media.use-case';

@Module({
  providers: [MediaRepository, UploadMediaUseCase, DeleteMediaUseCase],
  exports: [MediaRepository, UploadMediaUseCase, DeleteMediaUseCase],
})
export class MediaModule {}
