import { Module } from '@nestjs/common';
import { ContentClassificationsAdminController } from './content-classifications-admin.controller';
import { ContentClassificationsRepository } from './content-classifications.repository';
import { CreateContentClassificationUseCase } from './use-cases/create-content-classification.use-case';
import { GetContentClassificationsUseCase } from './use-cases/get-content-classifications.use-case';
import { GetContentClassificationUseCase } from './use-cases/get-content-classification.use-case';
import { UpdateContentClassificationUseCase } from './use-cases/update-content-classification.use-case';
import { DeleteContentClassificationUseCase } from './use-cases/delete-content-classification.use-case';
import { UploadContentClassificationIconUseCase } from './use-cases/upload-content-classification-icon.use-case';

@Module({
  controllers: [ContentClassificationsAdminController],
  providers: [
    ContentClassificationsRepository,
    CreateContentClassificationUseCase,
    GetContentClassificationsUseCase,
    GetContentClassificationUseCase,
    UpdateContentClassificationUseCase,
    DeleteContentClassificationUseCase,
    UploadContentClassificationIconUseCase,
  ],
  exports: [ContentClassificationsRepository],
})
export class ContentClassificationsModule {}
