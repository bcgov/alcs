import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { MultipartFile } from '@fastify/multipart';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initApplicationMockEntity } from '../../../../test/mocks/mockEntities';
import { DOCUMENT_SOURCE } from '../../../document/document.dto';
import { Document } from '../../../document/document.entity';
import { DocumentService } from '../../../document/document.service';
import { User } from '../../../user/user.entity';
import { UserService } from '../../../user/user.service';
import { ApplicationService } from '../application.service';
import {
  ApplicationDocumentCode,
  DOCUMENT_TYPE,
} from './application-document-code.entity';
import { ApplicationDocument } from './application-document.entity';
import { ApplicationDocumentService } from './application-document.service';

describe('ApplicationDocumentService', () => {
  let service: ApplicationDocumentService;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockRepository: DeepMocked<Repository<ApplicationDocument>>;
  let mockTypeRepository: DeepMocked<Repository<ApplicationDocumentCode>>;

  let mockApplication;
  const fileNumber = '12345';

  beforeEach(async () => {
    mockDocumentService = createMock();
    mockApplicationService = createMock();
    mockRepository = createMock();
    mockTypeRepository = createMock();

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
          provide: getRepositoryToken(ApplicationDocumentCode),
          useValue: mockTypeRepository,
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
    const mockUser = new User();
    const mockFile = {};
    const mockSavedDocument = {};

    mockRepository.save.mockResolvedValue(
      mockSavedDocument as ApplicationDocument,
    );

    const res = await service.attachDocument({
      fileNumber,
      file: mockFile as MultipartFile,
      user: mockUser,
      documentType: DOCUMENT_TYPE.DECISION_DOCUMENT,
      fileName: '',
      source: DOCUMENT_SOURCE.APPLICANT,
      visibilityFlags: [],
    });

    expect(mockApplicationService.getOrFail).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create.mock.calls[0][0]).toBe(
      'application/12345',
    );
    expect(mockDocumentService.create.mock.calls[0][2]).toBe(mockFile);
    expect(mockDocumentService.create.mock.calls[0][3]).toBe(mockUser);

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
    mockRepository.remove.mockResolvedValue({} as any);

    await service.delete(mockAppDocument);

    expect(mockDocumentService.softRemove).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.softRemove.mock.calls[0][0]).toBe(mockDocument);

    expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    expect(mockRepository.remove.mock.calls[0][0]).toBe(mockAppDocument);
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

    const res = await service.list(fileNumber);

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

  it('should load all applicant sourced documents correctly', async () => {
    const mockAppDocument = new ApplicationDocument({
      uuid: '1',
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
    });
    const mockLgDocument = new ApplicationDocument({
      uuid: '2',
      document: new Document({
        source: DOCUMENT_SOURCE.LFNG,
      }),
    });

    mockRepository.find.mockResolvedValue([mockAppDocument, mockLgDocument]);

    const res = await service.getApplicantDocuments('1');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0]).toBe(mockAppDocument);
  });

  it('should call delete for each document loaded', async () => {
    const mockAppDocument = new ApplicationDocument({
      uuid: '1',
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
    });
    const mockLgDocument = new ApplicationDocument({
      uuid: '2',
      document: new Document({
        source: DOCUMENT_SOURCE.LFNG,
      }),
    });

    mockRepository.find.mockResolvedValue([mockAppDocument, mockLgDocument]);
    mockDocumentService.softRemove.mockResolvedValue();

    const res = await service.deleteByType(DOCUMENT_TYPE.STAFF_REPORT, '');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.softRemove).toHaveBeenCalledTimes(2);
  });

  it('should call through for fetchTypes', async () => {
    mockTypeRepository.find.mockResolvedValue([]);

    const res = await service.fetchTypes();

    expect(mockTypeRepository.find).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should set the type and description for multiple files', async () => {
    const mockDocument1 = new ApplicationDocument({
      typeCode: DOCUMENT_TYPE.DECISION_DOCUMENT,
      description: undefined,
    });
    const mockDocument2 = new ApplicationDocument({
      typeCode: DOCUMENT_TYPE.DECISION_DOCUMENT,
      description: undefined,
    });
    mockRepository.findOne
      .mockResolvedValueOnce(mockDocument1)
      .mockResolvedValueOnce(mockDocument2);
    mockRepository.save.mockResolvedValue(new ApplicationDocument());
    const mockUpdates = [
      {
        uuid: '1',
        type: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        description: 'Secret Documents',
      },
      {
        uuid: '2',
        type: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        description: 'New Description',
      },
    ];

    const res = await service.updateDescriptionAndType(mockUpdates, '');

    expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
    expect(mockRepository.save).toHaveBeenCalledTimes(2);
    expect(res).toBeDefined();
    expect(res.length).toEqual(2);
    expect(mockDocument1.typeCode).toEqual(DOCUMENT_TYPE.CERTIFICATE_OF_TITLE);
    expect(mockDocument1.description).toEqual('Secret Documents');
    expect(mockDocument2.typeCode).toEqual(DOCUMENT_TYPE.RESOLUTION_DOCUMENT);
    expect(mockDocument2.description).toEqual('New Description');
  });

  it('should create a record for external documents', async () => {
    mockRepository.save.mockResolvedValue(new ApplicationDocument());
    mockApplicationService.getUuid.mockResolvedValueOnce('app-uuid');
    mockRepository.findOne.mockResolvedValue(new ApplicationDocument());

    const res = await service.attachExternalDocument(
      '',
      {
        type: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        description: '',
        documentUuid: 'fake-uuid',
      },
      [],
    );

    expect(mockApplicationService.getUuid).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].applicationUuid).toEqual(
      'app-uuid',
    );
    expect(mockRepository.save.mock.calls[0][0].typeCode).toEqual(
      DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
    );
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should delete the existing file and create a new when updating', async () => {
    mockRepository.findOne.mockResolvedValue(new ApplicationDocument());
    mockApplicationService.getFileNumber.mockResolvedValue('app-uuid');
    mockRepository.save.mockResolvedValue(new ApplicationDocument());
    mockDocumentService.create.mockResolvedValue(new Document());
    mockDocumentService.softRemove.mockResolvedValue();

    const res = await service.update({
      source: DOCUMENT_SOURCE.APPLICANT,
      fileName: 'fileName',
      user: new User(),
      file: {} as File,
      uuid: '',
      documentType: DOCUMENT_TYPE.DECISION_DOCUMENT,
      visibilityFlags: [],
    });

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockApplicationService.getFileNumber).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should load and save the documents with the new sort order', async () => {
    const mockDoc1 = new ApplicationDocument({
      uuid: 'uuid-1',
      evidentiaryRecordSorting: 5,
    });
    const mockDoc2 = new ApplicationDocument({
      uuid: 'uuid-2',
      evidentiaryRecordSorting: 6,
    });
    mockRepository.find.mockResolvedValue([mockDoc1, mockDoc2]);
    mockRepository.save.mockResolvedValue({} as any);

    await service.setSorting([
      {
        uuid: mockDoc1.uuid,
        order: 0,
      },
      {
        uuid: mockDoc2.uuid,
        order: 1,
      },
    ]);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockDoc1.evidentiaryRecordSorting).toEqual(0);
    expect(mockDoc2.evidentiaryRecordSorting).toEqual(1);
  });
});
