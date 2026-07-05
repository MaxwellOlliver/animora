import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { JwtPayload } from '@/common/types/jwt-payload.type';
import type { ProfileWithAvatar } from '@/common/types/profile.types';
import { GrpcClientService } from '@/grpc-client/grpc-client.service';

@Injectable()
export class ActiveProfileGuard implements CanActivate {
  constructor(private readonly grpcClient: GrpcClientService) {}

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

    const profile = await this.grpcClient.getOwnedProfile(profileId, user.sub);

    if (!profile) {
      throw new ForbiddenException('Profile does not belong to user');
    }

    request.activeProfile = profile;
    return true;
  }
}
