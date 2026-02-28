import { Injectable } from '@nestjs/common';
import { ContentClassificationsRepository } from '../content-classifications.repository';
import type { ContentClassification } from '../content-classification.entity';

@Injectable()
export class GetContentClassificationsUseCase {
  constructor(private readonly repo: ContentClassificationsRepository) {}

  async execute(): Promise<ContentClassification[]> {
    return this.repo.findAll();
  }
}
