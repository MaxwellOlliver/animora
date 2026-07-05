import { Module } from '@nestjs/common';

import { EpisodesModule } from '@/modules/admin/episodes/episodes.module';
import { ProfilesModule } from '@/modules/profiles/profiles.module';

import { InternalGrpcController } from './internal-grpc.controller';

@Module({
  imports: [ProfilesModule, EpisodesModule],
  controllers: [InternalGrpcController],
})
export class InternalGrpcModule {}
