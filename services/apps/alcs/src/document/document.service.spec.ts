import { CONFIG_TOKEN } from '@app/common/config/config.module';
import {
  BaseServiceException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockClient } from 'aws-sdk-client-mock';
import * as config from 'config';
import { Repository } from 'typeorm';
import { ClamAVService } from '../clamav/clamav.service';
import { User } from '../user/user.entity';
import {
  CreateDocumentDto,
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from './document.dto';
import { Document } from './document.entity';
import { DocumentService } from './document.service';

// The mock factory returns the function () => false
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(() => 'fake-url'),
}));

describe('DocumentService', () => {
  let service: DocumentService;
  const mockS3Client = mockClient(S3Client);
  let mockRepository: DeepMocked<Repository<Document>>;
  let mockClamAVService: DeepMocked<ClamAVService>;

  beforeEach(async () => {
    mockS3Client.reset();
    mockRepository = createMock();
    mockClamAVService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
        {
          provide: ClamAVService,
          useValue: mockClamAVService,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a put command and save to repo on create', async () => {
    const stub = mockS3Client.on(PutObjectCommand).resolves({});
    mockRepository.save.mockResolvedValue({} as Document);
    mockClamAVService.scanFile.mockResolvedValue(false);

    const res = await service.create(
      'dummy/path',
      'fileName',
      {
        toBuffer: () => {
          //EMPTY
        },
        file: {
          bytesRead: 0,
        },
      } as MultipartFile,
      {} as User,
      DOCUMENT_SOURCE.ALC,
      DOCUMENT_SYSTEM.PORTAL,
    );

    expect(stub.calls().length).toBe(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should delete file from repo on delete', async () => {
    mockRepository.softRemove.mockResolvedValue({} as any);

    const documentUuid = 'fake-uuid';

    await service.softRemove({
      uuid: documentUuid,
    } as Document);

    expect(mockRepository.softRemove).toHaveBeenCalledTimes(1);
  });

  it('should delete multiple files from repo on delete', async () => {
    mockRepository.softRemove.mockResolvedValue({} as any);

    const documentUuid = 'fake-uuid';

    await service.softRemoveMany([
      {
        uuid: documentUuid,
      } as Document,
    ]);

    expect(mockRepository.softRemove).toHaveBeenCalledTimes(1);
  });

  it('should call repository save on create Document', async () => {
    const mockDoc = {
      mimeType: 'mimeType',
      fileKey: 'fileKey',
      fileName: 'fileName',
      uploadedBy: null,
      source: DOCUMENT_SOURCE.APPLICANT,
    };
    mockRepository.save.mockResolvedValue(mockDoc as Document);
    mockClamAVService.scanFile.mockResolvedValue(false);
    const res = await service.createDocumentRecord({} as CreateDocumentDto);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockDoc);
  });

  it('should throw an exception when the uploaded document fails the virus scan', async () => {
    const mockDoc = {
      mimeType: 'mimeType',
      fileKey: 'fileKey',
      fileName: 'fileName',
      uploadedBy: null,
      source: DOCUMENT_SOURCE.APPLICANT,
    };
    mockRepository.save.mockResolvedValue(mockDoc as Document);
    mockClamAVService.scanFile.mockResolvedValue(true);
    const promise = service.createDocumentRecord({} as CreateDocumentDto);

    await expect(promise).rejects.toMatchObject(
      new BaseServiceException(
        'File may contain malicious data, upload blocked',
        403,
      ),
    );
    expect(mockRepository.save).toHaveBeenCalledTimes(0);
  });

  it('should call repository save on update Document', async () => {
    const mockDoc = new Document({
      mimeType: 'mimeType',
      fileKey: 'fileKey',
      fileName: 'fileName',
      uploadedBy: null,
      source: DOCUMENT_SOURCE.APPLICANT,
    });
    mockRepository.save.mockResolvedValue(mockDoc);
    await service.update(mockDoc, {
      source: DOCUMENT_SOURCE.APPLICANT,
      fileName: 'file',
    });
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should call through to repo for get', async () => {
    const mockDoc = new Document({
      mimeType: 'mimeType',
      fileKey: 'fileKey',
      fileName: 'fileName',
      uploadedBy: null,
      source: DOCUMENT_SOURCE.APPLICANT,
    });
    mockRepository.findOneOrFail.mockResolvedValue(mockDoc);

    const res = await service.getDocument('');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockDoc);
  });
});
