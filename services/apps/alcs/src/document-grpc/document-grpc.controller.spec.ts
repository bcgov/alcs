import { Test, TestingModule } from '@nestjs/testing';
import { DocumentGrpcController } from './document-grpc.controller';

describe('DocumentGrpcController', () => {
  let controller: DocumentGrpcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentGrpcController],
    }).compile();

    controller = module.get<DocumentGrpcController>(DocumentGrpcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
