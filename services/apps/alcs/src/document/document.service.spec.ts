import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockClient } from 'aws-sdk-client-mock';
import * as config from 'config';
import { Repository } from 'typeorm';
import { CONFIG_TOKEN } from '../common/config/config.module';
import { User } from '../user/user.entity';
import { CreateDocumentDto } from './document.dto';
import { Document } from './document.entity';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;
  const mockS3Client = mockClient(S3Client);
  let mockRepository: DeepMocked<Repository<Document>>;

  beforeEach(async () => {
    mockS3Client.reset();
    mockRepository = createMock<Repository<Document>>();

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

    const res = await service.create(
      'dummy/path',
      {
        toBuffer: () => {
          //EMPTY
        },
        file: {
          bytesRead: 0,
        },
      } as MultipartFile,
      {} as User,
    );

    expect(stub.calls().length).toBe(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should delete from s3 and repo on delete', async () => {
    mockRepository.softRemove.mockResolvedValue({} as any);

    const documentUuid = 'fake-uuid';

    await service.softRemove({
      uuid: documentUuid,
    } as Document);

    expect(mockRepository.softRemove).toHaveBeenCalledTimes(1);
  });

  it('should call repository save on create Document', async () => {
    const mockDoc = {
      mimeType: 'mimeType',
      fileKey: 'fileKey',
      fileName: 'fileName',
      uploadedBy: null,
      source: 'Applicant',
    };
    mockRepository.save.mockResolvedValue(mockDoc as Document);
    const res = await service.createDocumentRecord({} as CreateDocumentDto);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockDoc);
  });
});
