import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  CreateDocumentRequestGrpc,
  CreateDocumentResponseGrpc,
} from '../document-grpc/alcs-document.message.interface';
import {
  ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME,
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
} from './alcs-document.message.interface';
import { AlcsDocumentService } from './alcs-document.service';
import { AlcsDocumentServiceClient } from './alcs-document.service.interface';

describe('AlcsDocumentService', () => {
  let service: AlcsDocumentService;
  let alcsDocumentServiceClientMock: DeepMocked<AlcsDocumentServiceClient>;

  beforeEach(async () => {
    alcsDocumentServiceClientMock = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlcsDocumentService,
        {
          provide: ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME,
          useFactory: () => ({
            getService: () => alcsDocumentServiceClientMock,
          }),
        },
      ],
    }).compile();

    await module.init();

    service = module.get<AlcsDocumentService>(AlcsDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.createExternalDocument).toBeDefined();
  });

  it('should call service on getUploadUrl', async () => {
    const mockPayload: DocumentUploadRequestGrpc = { filePath: 'fake-path' };
    const mockResponse: DocumentUploadResponseGrpc = {
      uploadUrl: 'fake-uploadUrl',
      fileKey: 'fake-fileKey',
    };

    alcsDocumentServiceClientMock.getUploadUrl.mockReturnValue(
      of(mockResponse),
    );

    const result = await firstValueFrom(service.getUploadUrl(mockPayload));

    expect(alcsDocumentServiceClientMock.getUploadUrl).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResponse);
  });

  it('should call service on createExternalDocument', async () => {
    const mockPayload: CreateDocumentRequestGrpc = {
      mimeType: 'fake-mimeType',
      fileName: 'fake-fileName',
      fileKey: 'fake-fileKey',
      source: 'Applicant',
    };
    const mockResponse: CreateDocumentResponseGrpc = {
      alcsDocumentUuid: 'fake-alcsDocumentUuid',
    };

    alcsDocumentServiceClientMock.createExternalDocument.mockReturnValue(
      of(mockResponse),
    );

    const result = await firstValueFrom(
      service.createExternalDocument(mockPayload),
    );

    expect(
      alcsDocumentServiceClientMock.createExternalDocument,
    ).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResponse);
  });
});
