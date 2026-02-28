import { ConflictException, Injectable } from '@nestjs/common';
import { ContentClassificationsRepository } from '../content-classifications.repository';
import type { CreateContentClassificationDto } from '../dto/create-content-classification.dto';
import type { ContentClassification } from '../content-classification.entity';

@Injectable()
export class CreateContentClassificationUseCase {
  constructor(
    private readonly repo: ContentClassificationsRepository,
  ) {}

  async execute(dto: CreateContentClassificationDto): Promise<ContentClassification> {
    const existing = await this.repo.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Content classification with this name already exists');
    }
    return this.repo.create({ name: dto.name });
  }
}
