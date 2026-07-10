import { getWatchPartySupportProtoPath } from '@animora/contracts';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { API_INTERNAL_GRPC, GrpcClientService } from './grpc-client.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: API_INTERNAL_GRPC,
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC as const,
          options: {
            package: 'animora.internal',
            protoPath: getWatchPartySupportProtoPath(),
            url: config.getOrThrow<string>('API_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [GrpcClientService],
  exports: [GrpcClientService],
})
export class GrpcClientModule {}
