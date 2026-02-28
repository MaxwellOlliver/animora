import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentClassificationsRepository } from '../content-classifications.repository';
import type { UpdateContentClassificationDto } from '../dto/update-content-classification.dto';
import type { ContentClassification } from '../content-classification.entity';

@Injectable()
export class UpdateContentClassificationUseCase {
  constructor(private readonly repo: ContentClassificationsRepository) {}

  async execute(id: string, dto: UpdateContentClassificationDto): Promise<ContentClassification> {
    const classification = await this.repo.findById(id);
    if (!classification) throw new NotFoundException('Content classification not found');

    if (dto.name && dto.name !== classification.name) {
      const existing = await this.repo.findByName(dto.name);
      if (existing) throw new ConflictException('Content classification with this name already exists');
    }

    return this.repo.update(id, dto);
  }
}
