import { Injectable } from '@nestjs/common';

import type { ContentClassification } from '../content-classification.entity';
import { ContentClassificationsRepository } from '../content-classifications.repository';

@Injectable()
export class GetContentClassificationsUseCase {
  constructor(private readonly repo: ContentClassificationsRepository) {}

  async execute(): Promise<ContentClassification[]> {
    return this.repo.findAll();
  }
}
