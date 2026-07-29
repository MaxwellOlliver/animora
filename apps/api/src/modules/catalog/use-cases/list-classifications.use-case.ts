import { Injectable } from '@nestjs/common';

import { ContentClassificationsRepository } from '@/modules/admin/content-classifications/content-classifications.repository';

@Injectable()
export class ListClassificationsUseCase {
  constructor(
    private readonly classificationsRepository: ContentClassificationsRepository,
  ) {}

  async execute() {
    const classifications = await this.classificationsRepository.findAll();
    return classifications.filter((classification) => classification.active);
  }
}
