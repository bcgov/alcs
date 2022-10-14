import { MultipartFile } from '@fastify/multipart';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { initApplicationMockEntity } from '../../common/utils/test-helpers/mockEntities';
import { Document } from '../../document/document.entity';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { ApplicationService } from '../application.service';
import { ApplicationDocument } from './application-document.entity';
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
      'decisionDocument',
    );

    expect(mockApplicationService.getOrFail).toHaveBeenCalled();
    expect(mockDocumentService.create).toHaveBeenCalled();
    expect(mockDocumentService.create.mock.calls[0][0]).toBe(
      'application/12345',
    );
    expect(mockDocumentService.create.mock.calls[0][1]).toBe(mockFile);
    expect(mockDocumentService.create.mock.calls[0][2]).toBe(mockUser);

    expect(mockRepository.save).toHaveBeenCalled();
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
    mockRepository.delete.mockResolvedValue(undefined);

    await service.delete(mockAppDocument);

    expect(mockDocumentService.softRemove).toHaveBeenCalled();
    expect(mockDocumentService.softRemove.mock.calls[0][0]).toBe(mockDocument);

    expect(mockRepository.delete).toHaveBeenCalled();
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
    mockRepository.findOne.mockResolvedValue(undefined);

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

    const res = await service.list(fileNumber, 'decisionDocument');

    expect(mockRepository.find).toHaveBeenCalled();
    expect(res[0]).toBe(mockAppDocument);
  });

  it('should call through for listAll', async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as ApplicationDocument;
    mockRepository.find.mockResolvedValue([mockAppDocument]);

    const res = await service.listAll([fileNumber], 'decisionDocument');

    expect(mockRepository.find).toHaveBeenCalled();
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

    expect(mockDocumentService.getDownloadUrl).toHaveBeenCalled();
    expect(res).toEqual(fakeUrl);
  });
});
