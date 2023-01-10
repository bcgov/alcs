import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { of } from 'rxjs';
import { Repository } from 'typeorm';
import { DocumentUploadResponseGrpc } from '../alcs/document-grpc/alcs-document.message.interface';
import { AlcsDocumentService } from '../alcs/document-grpc/alcs-document.service';
import { Document } from './document.entity';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;

  let mockAlcsDocumentService: DeepMocked<AlcsDocumentService>;
  let mockRepository: DeepMocked<Repository<Document>>;

  beforeEach(async () => {
    mockAlcsDocumentService = createMock();
    mockRepository = createMock();

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
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call out to ALCS for deletion', async () => {
    mockAlcsDocumentService.deleteExternalDocument.mockReturnValue(
      of({
        uuid: '',
      }),
    );
    mockRepository.delete.mockResolvedValue({} as any);

    await service.delete(new Document());

    expect(
      mockAlcsDocumentService.deleteExternalDocument,
    ).toHaveBeenCalledTimes(1);
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should call out to ALCS for getDownloadUrl', async () => {
    mockAlcsDocumentService.getDownloadUrl.mockReturnValue(
      of({
        url: '',
      }),
    );

    await service.getDownloadUrl('');

    expect(mockAlcsDocumentService.getDownloadUrl).toHaveBeenCalledTimes(1);
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
