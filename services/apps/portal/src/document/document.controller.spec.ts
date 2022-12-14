import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { DocumentUploadResponseGrpc } from '../alcs/document-grpc/alcs-document.message.interface';
import { DocumentService } from '../alcs/document/document.service';
import { DocumentController } from './document.controller';

describe('DocumentController', () => {
  let controller: DocumentController;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service to get url ', async () => {
    mockDocumentService.getUploadUrl.mockReturnValue(
      of({} as DocumentUploadResponseGrpc),
    );

    await controller.getUploadUrl('mock', 'certificateOfTitle');

    expect(mockDocumentService.getUploadUrl).toBeCalledTimes(1);
  });
});
