import { Module } from '@nestjs/common';
import { GrpcReflectionModule } from 'nestjs-grpc-reflection';
import { ApplicationModule } from '../application/application.module';
import { grpcOptions } from '../providers/grpc/grpc.options.config';
import { ApplicationGrpcController } from './alcs-application.controller';

@Module({
  imports: [GrpcReflectionModule.register(grpcOptions), ApplicationModule],
  controllers: [ApplicationGrpcController],
})
export class ApplicationGrpcModule {}
