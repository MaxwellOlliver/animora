import { Injectable, NotFoundException } from '@nestjs/common';

import type { ContentClassification } from '../content-classification.entity';
import { ContentClassificationsRepository } from '../content-classifications.repository';

@Injectable()
export class GetContentClassificationUseCase {
  constructor(private readonly repo: ContentClassificationsRepository) {}

  async execute(id: string): Promise<ContentClassification> {
    const classification = await this.repo.findById(id);
    if (!classification)
      throw new NotFoundException('Content classification not found');
    return classification;
  }
}
