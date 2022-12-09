import { Module } from '@nestjs/common';
import { GrpcReflectionModule } from 'nestjs-grpc-reflection';
import { ApplicationModule } from '../application/application.module';
import { AlcsApplicationProfile } from '../common/automapper/grpc/application.automapper.profile';
import { grpcOptions } from '../providers/grpc/grpc.options.config';
import { ApplicationGrpcController } from './alcs-application.controller';
import { AlcsApplicationDocumentControllerGrpc } from './application-document-grpc/alcs-application-document.controller';

@Module({
  imports: [GrpcReflectionModule.register(grpcOptions), ApplicationModule],
  providers: [AlcsApplicationProfile],
  controllers: [
    ApplicationGrpcController,
    AlcsApplicationDocumentControllerGrpc,
  ],
})
export class ApplicationGrpcModule {}
