import { Test, TestingModule } from '@nestjs/testing';
import { AlcsApplicationDocumentControllerGrpc } from './alcs-application-document.controller';

describe('AlcsApplicationDocumentControllerGrpc', () => {
  let controller: AlcsApplicationDocumentControllerGrpc;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlcsApplicationDocumentControllerGrpc],
    }).compile();

    controller = module.get<AlcsApplicationDocumentControllerGrpc>(
      AlcsApplicationDocumentControllerGrpc,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
