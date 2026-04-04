import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { JwtPayload } from '@/modules/auth/strategies/jwt.strategy';
import {
  ProfilesRepository,
  type ProfileWithAvatar,
} from '@/modules/profiles/profiles.repository';

@Injectable()
export class ActiveProfileGuard implements CanActivate {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: JwtPayload;
      headers: Record<string, string | string[] | undefined>;
      activeProfile?: ProfileWithAvatar;
    }>();

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException(
        'Authenticated user not found in request',
      );
    }

    const header = request.headers['x-profile-id'];
    const profileId = Array.isArray(header) ? header[0] : header;

    if (!profileId) {
      throw new BadRequestException('Missing x-profile-id header');
    }

    const profile = await this.profilesRepository.findOwnedByUser(
      profileId,
      user.sub,
    );

    if (!profile) {
      throw new ForbiddenException('Profile does not belong to user');
    }

    request.activeProfile = profile;
    return true;
  }
}
