import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as config from 'config';
import { DeleteResult, Repository } from 'typeorm';
import { CONFIG_TOKEN } from '../common/config/config.module';
import { User } from '../user/user.entity';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { mockClient } from 'aws-sdk-client-mock';

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
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should delete from s3 and repo on delete', async () => {
    const stub = mockS3Client.on(DeleteObjectCommand).resolves({});
    mockRepository.delete.mockResolvedValue({} as DeleteResult);

    const documentUuid = 'fake-uuid';

    await service.delete({
      uuid: documentUuid,
    } as Document);

    expect(stub.calls().length).toBe(1);
    expect(mockRepository.delete).toHaveBeenCalled();
  });

  it('should call client to prepare the URL', async () => {
    const documentUuid = 'fake-uuid';

    const res = await service.getUrl({
      uuid: documentUuid,
    } as Document);
  });
});
