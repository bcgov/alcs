import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { DocumentService } from '../../document/document.service';
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
    mockDocumentService.getUploadUrl.mockResolvedValue({
      uploadUrl: '',
      fileKey: '',
    });

    await controller.getUploadUrl('mock', DOCUMENT_TYPE.CERTIFICATE_OF_TITLE);

    expect(mockDocumentService.getUploadUrl).toBeCalledTimes(1);
  });
});
