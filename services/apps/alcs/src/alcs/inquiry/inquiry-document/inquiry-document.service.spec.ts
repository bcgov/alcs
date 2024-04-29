import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { MultipartFile } from '@fastify/multipart';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { Inquiry } from '../inquiry.entity';
import { InquiryService } from '../inquiry.service';
import { InquiryDocument } from './inquiry-document.entity';
import { InquiryDocumentService } from './inquiry-document.service';

describe('InquiryDocumentService', () => {
  let service: InquiryDocumentService;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockInquiryService: DeepMocked<InquiryService>;
  let mockRepository: DeepMocked<Repository<InquiryDocument>>;
  let mockTypeRepository: DeepMocked<Repository<DocumentCode>>;

  let mockInquiry;
  const fileNumber = '12345';

  beforeEach(async () => {
    mockDocumentService = createMock();
    mockInquiryService = createMock();
    mockRepository = createMock();
    mockTypeRepository = createMock();

    mockInquiry = new Inquiry();
    mockInquiryService.getByFileNumber.mockResolvedValue(mockInquiry);
    mockDocumentService.create.mockResolvedValue({} as Document);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiryDocumentService,
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: InquiryService,
          useValue: mockInquiryService,
        },
        {
          provide: getRepositoryToken(DocumentCode),
          useValue: mockTypeRepository,
        },
        {
          provide: getRepositoryToken(InquiryDocument),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    }).compile();

    service = module.get<InquiryDocumentService>(InquiryDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a document in the happy path', async () => {
    const mockUser = new User();
    const mockFile = {};
    const mockSavedDocument = {};

    mockRepository.save.mockResolvedValue(mockSavedDocument as InquiryDocument);

    const res = await service.attachDocument({
      fileNumber,
      file: mockFile as MultipartFile,
      user: mockUser,
      documentType: DOCUMENT_TYPE.DECISION_DOCUMENT,
      fileName: '',
      source: DOCUMENT_SOURCE.APPLICANT,
      system: DOCUMENT_SYSTEM.PORTAL,
    });

    expect(mockInquiryService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create.mock.calls[0][0]).toBe('inquiry/12345');
    expect(mockDocumentService.create.mock.calls[0][2]).toBe(mockFile);
    expect(mockDocumentService.create.mock.calls[0][3]).toBe(mockUser);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].inquiry).toBe(mockInquiry);

    expect(res).toBe(mockSavedDocument);
  });

  it('should delete document and inquiry document when deleting', async () => {
    const mockDocument = {};
    const mockIncDocument = {
      uuid: '1',
      document: mockDocument,
    } as InquiryDocument;

    mockDocumentService.softRemove.mockResolvedValue();
    mockRepository.remove.mockResolvedValue({} as any);

    await service.delete(mockIncDocument);

    expect(mockDocumentService.softRemove).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.softRemove.mock.calls[0][0]).toBe(mockDocument);

    expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    expect(mockRepository.remove.mock.calls[0][0]).toBe(mockIncDocument);
  });

  it('should call through for get', async () => {
    const mockDocument = {};
    const mockIncDocument = {
      uuid: '1',
      document: mockDocument,
    } as InquiryDocument;

    mockDocumentService.softRemove.mockResolvedValue();
    mockRepository.findOne.mockResolvedValue(mockIncDocument);

    const res = await service.get('fake-uuid');
    expect(res).toBe(mockIncDocument);
  });

  it("should throw an exception when getting a document that doesn't exist", async () => {
    const mockDocument = {};
    const mockIncDocument = {
      uuid: '1',
      document: mockDocument,
    } as InquiryDocument;

    mockDocumentService.softRemove.mockResolvedValue();
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.get(mockIncDocument.uuid)).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Failed to find document ${mockIncDocument.uuid}`,
      ),
    );
  });

  it('should call through for list', async () => {
    const mockDocument = {};
    const mockIncDocument = {
      uuid: '1',
      document: mockDocument,
    } as InquiryDocument;
    mockRepository.find.mockResolvedValue([mockIncDocument]);

    const res = await service.list(fileNumber);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res[0]).toBe(mockIncDocument);
  });

  it('should call through for download', async () => {
    const mockDocument = {};
    const mockIncDocument = {
      uuid: '1',
      document: mockDocument,
    } as InquiryDocument;

    const fakeUrl = 'mock-url';
    mockDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);

    const res = await service.getInlineUrl(mockIncDocument);

    expect(mockDocumentService.getDownloadUrl).toHaveBeenCalledTimes(1);
    expect(res).toEqual(fakeUrl);
  });

  it('should call delete for each document loaded', async () => {
    const mockIncDocument = new InquiryDocument({
      uuid: '1',
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
    });
    const mockLgDocument = new InquiryDocument({
      uuid: '2',
      document: new Document({
        source: DOCUMENT_SOURCE.LFNG,
      }),
    });

    mockRepository.find.mockResolvedValue([mockIncDocument, mockLgDocument]);
    mockDocumentService.softRemove.mockResolvedValue();
    mockRepository.remove.mockResolvedValue({} as any);

    await service.deleteByType(DOCUMENT_TYPE.STAFF_REPORT, '');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.softRemove).toHaveBeenCalledTimes(2);
  });

  it('should call through for fetchTypes', async () => {
    mockTypeRepository.find.mockResolvedValue([]);

    const res = await service.fetchTypes();

    expect(mockTypeRepository.find).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should create a record for external documents', async () => {
    mockRepository.save.mockResolvedValue(new InquiryDocument());
    mockInquiryService.getUuid.mockResolvedValueOnce('app-uuid');
    mockRepository.findOne.mockResolvedValue(new InquiryDocument());

    const res = await service.attachExternalDocument('', {
      type: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
      documentUuid: 'fake-uuid',
    });

    expect(mockInquiryService.getUuid).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].inquiryUuid).toEqual(
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
      new InquiryDocument({
        document: new Document(),
      }),
    );
    mockInquiryService.getFileNumber.mockResolvedValue('inc-uuid');
    mockRepository.save.mockResolvedValue(new InquiryDocument());
    mockDocumentService.create.mockResolvedValue(new Document());
    mockDocumentService.softRemove.mockResolvedValue();

    await service.update({
      source: DOCUMENT_SOURCE.APPLICANT,
      fileName: 'fileName',
      user: new User(),
      file: {} as File,
      uuid: '',
      documentType: DOCUMENT_TYPE.DECISION_DOCUMENT,
    });

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockInquiryService.getFileNumber).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
