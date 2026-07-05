import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { ProfileWithAvatar } from '@/common/types/profile.types';

export const ActiveProfile = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ProfileWithAvatar | undefined => {
    const request = ctx.switchToHttp().getRequest<{
      activeProfile?: ProfileWithAvatar;
    }>();
    return request.activeProfile;
  },
);
