import { Module } from '@nestjs/common';
import { GrpcReflectionModule } from 'nestjs-grpc-reflection';
import { grpcOptions } from '../providers/grpc/grpc.options.config';

@Module({
  imports: [GrpcReflectionModule.register(grpcOptions)],
})
export class ApplicationGrpcModule {}
