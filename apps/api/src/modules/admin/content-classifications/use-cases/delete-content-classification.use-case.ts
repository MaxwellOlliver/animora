import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentClassificationsRepository } from '../content-classifications.repository';

@Injectable()
export class DeleteContentClassificationUseCase {
  constructor(private readonly repo: ContentClassificationsRepository) {}

  async execute(id: string): Promise<void> {
    const classification = await this.repo.findById(id);
    if (!classification) throw new NotFoundException('Content classification not found');
    await this.repo.delete(id);
  }
}
