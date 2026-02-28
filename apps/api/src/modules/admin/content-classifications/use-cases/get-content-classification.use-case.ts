import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentClassificationsRepository } from '../content-classifications.repository';
import type { ContentClassification } from '../content-classification.entity';

@Injectable()
export class GetContentClassificationUseCase {
  constructor(private readonly repo: ContentClassificationsRepository) {}

  async execute(id: string): Promise<ContentClassification> {
    const classification = await this.repo.findById(id);
    if (!classification) throw new NotFoundException('Content classification not found');
    return classification;
  }
}
