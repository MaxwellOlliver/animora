import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProfilesRepository } from '../profiles.repository.js';

@Injectable()
export class DeleteProfileUseCase {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(input: { userId: string; profileId: string }): Promise<void> {
    const profile = await this.profilesRepository.findById(input.profileId);

    if (!profile || profile.userId !== input.userId) {
      throw new NotFoundException('Profile not found');
    }

    const count = await this.profilesRepository.countByUserId(input.userId);
    if (count <= 1) {
      throw new ConflictException('Cannot delete the last profile');
    }

    await this.profilesRepository.delete(input.profileId);
  }
}
