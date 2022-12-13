import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from '../document/document.service';
import { UserService } from '../user/user.service';
import { DocumentGrpcController } from './document-grpc.controller';

describe('DocumentGrpcController', () => {
  let controller: DocumentGrpcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentGrpcController],
      providers: [
        { provide: DocumentService, useValue: createMock<DocumentService>() },
        { provide: UserService, useValue: createMock<UserService>() },
      ],
    }).compile();

    controller = module.get<DocumentGrpcController>(DocumentGrpcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
