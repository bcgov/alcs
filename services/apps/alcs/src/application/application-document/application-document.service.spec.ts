import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { MultipartFile } from '@fastify/multipart';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initApplicationMockEntity } from '../../../test/mocks/mockEntities';
import { Document } from '../../document/document.entity';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { ApplicationService } from '../application.service';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from './application-document.entity';
import { ApplicationDocumentService } from './application-document.service';

describe('ApplicationDocumentService', () => {
  let service: ApplicationDocumentService;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockRepository: DeepMocked<Repository<ApplicationDocument>>;

  let mockApplication;
  const fileNumber = '12345';

  beforeEach(async () => {
    mockDocumentService = createMock<DocumentService>();
    mockApplicationService = createMock<ApplicationService>();
    mockRepository = createMock<Repository<ApplicationDocument>>();

    mockApplication = initApplicationMockEntity(fileNumber);
    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
    mockDocumentService.create.mockResolvedValue({} as Document);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDocumentService,
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: getRepositoryToken(ApplicationDocument),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    }).compile();

    service = module.get<ApplicationDocumentService>(
      ApplicationDocumentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a document in the happy path', async () => {
    const mockUser = {};
    const mockFile = {};
    const mockSavedDocument = {};

    mockRepository.save.mockResolvedValue(
      mockSavedDocument as ApplicationDocument,
    );

    const res = await service.attachDocument(
      fileNumber,
      mockFile as MultipartFile,
      mockUser as User,
      DOCUMENT_TYPE.DECISION_DOCUMENT,
    );

    expect(mockApplicationService.getOrFail).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create.mock.calls[0][0]).toBe(
      'application/12345',
    );
    expect(mockDocumentService.create.mock.calls[0][1]).toBe(mockFile);
    expect(mockDocumentService.create.mock.calls[0][2]).toBe(mockUser);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].application).toBe(
      mockApplication,
    );

    expect(res).toBe(mockSavedDocument);
  });

  it('should delete document and application document when deleting', async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as ApplicationDocument;

    mockDocumentService.softRemove.mockResolvedValue();
    mockRepository.delete.mockResolvedValue({} as any);

    await service.delete(mockAppDocument);

    expect(mockDocumentService.softRemove).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.softRemove.mock.calls[0][0]).toBe(mockDocument);

    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    expect(mockRepository.delete.mock.calls[0][0]).toBe(mockAppDocument.uuid);
  });

  it('should call through for get', async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as ApplicationDocument;

    mockDocumentService.softRemove.mockResolvedValue();
    mockRepository.findOne.mockResolvedValue(mockAppDocument);

    const res = await service.get('fake-uuid');
    expect(res).toBe(mockAppDocument);
  });

  it("should throw an exception when getting a document that doesn't exist", async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as ApplicationDocument;

    mockDocumentService.softRemove.mockResolvedValue();
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.get(mockAppDocument.uuid)).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Failed to find document ${mockAppDocument.uuid}`,
      ),
    );
  });

  it('should call through for list', async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as ApplicationDocument;
    mockRepository.find.mockResolvedValue([mockAppDocument]);

    const res = await service.list(fileNumber, DOCUMENT_TYPE.DECISION_DOCUMENT);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res[0]).toBe(mockAppDocument);
  });

  it('should call through for listAll', async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as ApplicationDocument;
    mockRepository.find.mockResolvedValue([mockAppDocument]);

    const res = await service.listAll(
      [fileNumber],
      DOCUMENT_TYPE.DECISION_DOCUMENT,
    );

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res[0]).toBe(mockAppDocument);
  });

  it('should call through for download', async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as ApplicationDocument;

    const fakeUrl = 'mock-url';
    mockDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);

    const res = await service.getInlineUrl(mockAppDocument);

    expect(mockDocumentService.getDownloadUrl).toHaveBeenCalledTimes(1);
    expect(res).toEqual(fakeUrl);
  });
});
