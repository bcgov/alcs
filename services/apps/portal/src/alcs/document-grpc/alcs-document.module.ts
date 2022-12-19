import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { AlcsDocumentService } from './alcs-document.service';
import { ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME } from './alcs-document.message.interface';
import { grpcClientOptions } from '../../providers/grpc/grpc-client.options';

@Module({
  providers: [
    AlcsDocumentService,
    {
      provide: ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME,
      useFactory: () => {
        return ClientProxyFactory.create(grpcClientOptions);
      },
    },
  ],
  exports: [AlcsDocumentService],
})
export class AlcsDocumentModule {}
