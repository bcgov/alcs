import { Module } from '@nestjs/common';

@Module({
  // disable till we get certs and proto in deployed env
  // imports: [GrpcReflectionModule.register(grpcOptions)],
})
export class ApplicationGrpcModule {}
