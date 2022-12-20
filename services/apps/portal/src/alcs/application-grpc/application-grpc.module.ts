import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { grpcClientOptions } from '../../providers/grpc/grpc-client.options';
import { ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME } from './alcs-application.message.interface';
import { AlcsApplicationService } from './alcs-application.service';

@Module({
  providers: [
    AlcsApplicationService,
    {
      provide: ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME,
      useFactory: () => {
        return ClientProxyFactory.create(grpcClientOptions);
      },
    },
  ],
  exports: [AlcsApplicationService],
})
export class ApplicationGrpcModule {}
