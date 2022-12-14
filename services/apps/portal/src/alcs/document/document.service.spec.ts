import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { of } from 'rxjs';
import { CONFIG_TOKEN } from '../../common/config/config.module';
import { DocumentUploadResponseGrpc } from '../document-grpc/alcs-document.message.interface';
import { AlcsDocumentService } from '../document-grpc/alcs-document.service';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;

  let mockAlcsDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockAlcsDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: AlcsDocumentService,
          useValue: mockAlcsDocumentService,
        },
        {
          provide: AlcsDocumentService,
          useValue: mockAlcsDocumentService,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call out to ALCS for creation', async () => {
    // TODO
  });

  it('should call out to ALCS for deletion', async () => {
    // TODO
  });

  it('should call out to ALCS for getDownloadUrl', async () => {
    // TODO
  });

  it('should call out to ALCS for getUploadUrl', async () => {
    const mockRes = {
      uploadUrl: 'uploadUrlMock',
      fileKey: 'fileKeyMock',
    } as DocumentUploadResponseGrpc;

    mockAlcsDocumentService.getUploadUrl.mockReturnValue(of(mockRes));

    await service.getUploadUrl('mock');

    expect(mockAlcsDocumentService.getUploadUrl).toBeCalledTimes(1);
  });
});
