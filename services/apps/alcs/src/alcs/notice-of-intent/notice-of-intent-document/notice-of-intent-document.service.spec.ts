import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { MultipartFile } from '@fastify/multipart';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initApplicationMockEntity } from '../../../../test/mocks/mockEntities';
import {
  DOCUMENT_TYPE,
  DocumentCode,
} from '../../../document/document-code.entity';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { Document } from '../../../document/document.entity';
import { DocumentService } from '../../../document/document.service';
import { User } from '../../../user/user.entity';
import { UserService } from '../../../user/user.service';
import { NoticeOfIntentService } from '../notice-of-intent.service';
import { NoticeOfIntentDocument } from './notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from './notice-of-intent-document.service';

describe('NoticeOfIntentDocumentService', () => {
  let service: NoticeOfIntentDocumentService;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockNOIService: DeepMocked<NoticeOfIntentService>;
  let mockRepository: DeepMocked<Repository<NoticeOfIntentDocument>>;
  let mockTypeRepository: DeepMocked<Repository<DocumentCode>>;

  let mockApplication;
  const fileNumber = '12345';

  beforeEach(async () => {
    mockDocumentService = createMock();
    mockNOIService = createMock();
    mockRepository = createMock();
    mockTypeRepository = createMock();

    mockApplication = initApplicationMockEntity(fileNumber);
    mockNOIService.getByFileNumber.mockResolvedValue(mockApplication);
    mockDocumentService.create.mockResolvedValue({} as Document);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentDocumentService,
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNOIService,
        },
        {
          provide: getRepositoryToken(DocumentCode),
          useValue: mockTypeRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentDocument),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentDocumentService>(
      NoticeOfIntentDocumentService,
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
      mockSavedDocument as NoticeOfIntentDocument,
    );

    const res = await service.attachDocument({
      fileNumber,
      file: mockFile as MultipartFile,
      user: mockUser,
      documentType: DOCUMENT_TYPE.DECISION_DOCUMENT,
      fileName: '',
      source: DOCUMENT_SOURCE.APPLICANT,
      system: DOCUMENT_SYSTEM.PORTAL,
      visibilityFlags: [],
    });

    expect(mockNOIService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create.mock.calls[0][0]).toBe(
      'noticeOfIntent/12345',
    );
    expect(mockDocumentService.create.mock.calls[0][2]).toBe(mockFile);
    expect(mockDocumentService.create.mock.calls[0][3]).toBe(mockUser);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].noticeOfIntent).toBe(
      mockApplication,
    );

    expect(res).toBe(mockSavedDocument);
  });

  it('should delete document and application document when deleting', async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as NoticeOfIntentDocument;

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
    } as NoticeOfIntentDocument;

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
    } as NoticeOfIntentDocument;

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
    const mockNoiDocument = {
      uuid: '1',
      document: mockDocument,
    } as NoticeOfIntentDocument;
    mockRepository.find.mockResolvedValue([mockNoiDocument]);

    const res = await service.list(fileNumber);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res[0]).toBe(mockNoiDocument);
  });

  it('should call through for download', async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as NoticeOfIntentDocument;

    const fakeUrl = 'mock-url';
    mockDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);

    const res = await service.getInlineUrl(mockAppDocument);

    expect(mockDocumentService.getDownloadUrl).toHaveBeenCalledTimes(1);
    expect(res).toEqual(fakeUrl);
  });

  it('should load all applicant sourced documents correctly', async () => {
    const mockAppDocument = new NoticeOfIntentDocument({
      uuid: '1',
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
    });
    const mockLgDocument = new NoticeOfIntentDocument({
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
    const mockAppDocument = new NoticeOfIntentDocument({
      uuid: '1',
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
    });
    const mockLgDocument = new NoticeOfIntentDocument({
      uuid: '2',
      document: new Document({
        source: DOCUMENT_SOURCE.LFNG,
      }),
    });

    mockRepository.find.mockResolvedValue([mockAppDocument, mockLgDocument]);
    mockDocumentService.softRemove.mockResolvedValue();
    mockRepository.remove.mockResolvedValue({} as any);

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

  // it('should set the type and description for multiple files', async () => {
  //   const mockDocument1 = new NoticeOfIntentDocument({
  //     typeCode: DOCUMENT_TYPE.DECISION_DOCUMENT,
  //     description: undefined,
  //   });
  //   const mockDocument2 = new NoticeOfIntentDocument({
  //     typeCode: DOCUMENT_TYPE.DECISION_DOCUMENT,
  //     description: undefined,
  //   });
  //   mockRepository.findOne
  //     .mockResolvedValueOnce(mockDocument1)
  //     .mockResolvedValueOnce(mockDocument2);
  //   mockRepository.save.mockResolvedValue(new NoticeOfIntentDocument());
  //   const mockUpdates = [
  //     {
  //       uuid: '1',
  //       type: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
  //       description: 'Secret Documents',
  //     },
  //     {
  //       uuid: '2',
  //       type: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
  //       description: 'New Description',
  //     },
  //   ];
  //
  //   const res = await service.updateDescriptionAndType(mockUpdates, '');
  //
  //   expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
  //   expect(mockRepository.save).toHaveBeenCalledTimes(2);
  //   expect(res).toBeDefined();
  //   expect(res.length).toEqual(2);
  //   expect(mockDocument1.typeCode).toEqual(DOCUMENT_TYPE.CERTIFICATE_OF_TITLE);
  //   expect(mockDocument1.description).toEqual('Secret Documents');
  //   expect(mockDocument2.typeCode).toEqual(DOCUMENT_TYPE.RESOLUTION_DOCUMENT);
  //   expect(mockDocument2.description).toEqual('New Description');
  // });

  it('should create a record for external documents', async () => {
    mockRepository.save.mockResolvedValue(new NoticeOfIntentDocument());
    mockNOIService.getUuid.mockResolvedValueOnce('app-uuid');
    mockRepository.findOne.mockResolvedValue(new NoticeOfIntentDocument());

    const res = await service.attachExternalDocument(
      '',
      {
        type: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        description: '',
        documentUuid: 'fake-uuid',
      },
      [],
    );

    expect(mockNOIService.getUuid).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].noticeOfIntentUuid).toEqual(
      'app-uuid',
    );
    expect(mockRepository.save.mock.calls[0][0].typeCode).toEqual(
      DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
    );
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should delete the existing file and create a new when updating', async () => {
    mockRepository.findOne.mockResolvedValue(
      new NoticeOfIntentDocument({
        document: new Document(),
      }),
    );
    mockNOIService.getFileNumber.mockResolvedValue('app-uuid');
    mockRepository.save.mockResolvedValue(new NoticeOfIntentDocument());
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
    expect(mockNOIService.getFileNumber).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
