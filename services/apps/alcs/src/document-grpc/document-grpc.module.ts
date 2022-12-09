import { Module } from '@nestjs/common';
import { GrpcReflectionModule } from 'nestjs-grpc-reflection';
import { DocumentModule } from '../document/document.module';
import { grpcOptions } from '../providers/grpc/grpc.options.config';
import { DocumentGrpcController } from './document-grpc.controller';

@Module({
  imports: [GrpcReflectionModule.register(grpcOptions), DocumentModule],
  controllers: [DocumentGrpcController],
})
export class DocumentGrpcModule {}
