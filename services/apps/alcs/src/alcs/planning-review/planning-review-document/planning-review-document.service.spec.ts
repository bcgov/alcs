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
import { PlanningReview } from '../planning-review.entity';
import { PlanningReviewService } from '../planning-review.service';
import { PlanningReviewDocument } from './planning-review-document.entity';
import { PlanningReviewDocumentService } from './planning-review-document.service';

describe('PlanningReviewDocumentService', () => {
  let service: PlanningReviewDocumentService;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockPlanningReviewService: DeepMocked<PlanningReviewService>;
  let mockRepository: DeepMocked<Repository<PlanningReviewDocument>>;
  let mockTypeRepository: DeepMocked<Repository<DocumentCode>>;

  let mockPlanningReview;
  const fileNumber = '12345';

  beforeEach(async () => {
    mockDocumentService = createMock();
    mockPlanningReviewService = createMock();
    mockRepository = createMock();
    mockTypeRepository = createMock();

    mockPlanningReview = new PlanningReview({
      fileNumber,
    });
    mockPlanningReviewService.getDetailedReview.mockResolvedValue(
      mockPlanningReview,
    );
    mockDocumentService.create.mockResolvedValue({} as Document);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningReviewDocumentService,
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: PlanningReviewService,
          useValue: mockPlanningReviewService,
        },
        {
          provide: getRepositoryToken(DocumentCode),
          useValue: mockTypeRepository,
        },
        {
          provide: getRepositoryToken(PlanningReviewDocument),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PlanningReviewDocumentService>(
      PlanningReviewDocumentService,
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
      mockSavedDocument as PlanningReviewDocument,
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

    expect(mockPlanningReviewService.getDetailedReview).toHaveBeenCalledTimes(
      1,
    );
    expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create.mock.calls[0][0]).toBe(
      'planning-review/12345',
    );
    expect(mockDocumentService.create.mock.calls[0][2]).toBe(mockFile);
    expect(mockDocumentService.create.mock.calls[0][3]).toBe(mockUser);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].planningReview).toBe(
      mockPlanningReview,
    );

    expect(res).toBe(mockSavedDocument);
  });

  it('should delete document and planning review document when deleting', async () => {
    const mockDocument = {};
    const mockAppDocument = {
      uuid: '1',
      document: mockDocument,
    } as PlanningReviewDocument;

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
    } as PlanningReviewDocument;

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
    } as PlanningReviewDocument;

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
    } as PlanningReviewDocument;
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
    } as PlanningReviewDocument;

    const fakeUrl = 'mock-url';
    mockDocumentService.getDownloadUrl.mockResolvedValue(fakeUrl);

    const res = await service.getInlineUrl(mockAppDocument);

    expect(mockDocumentService.getDownloadUrl).toHaveBeenCalledTimes(1);
    expect(res).toEqual(fakeUrl);
  });

  it('should call through for fetchTypes', async () => {
    mockTypeRepository.find.mockResolvedValue([]);

    const res = await service.fetchTypes();

    expect(mockTypeRepository.find).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should create a record for external documents', async () => {
    mockRepository.save.mockResolvedValue(new PlanningReviewDocument());
    mockPlanningReviewService.getDetailedReview.mockResolvedValueOnce(
      mockPlanningReview,
    );
    mockRepository.findOne.mockResolvedValue(new PlanningReviewDocument());

    const res = await service.attachExternalDocument(
      '',
      {
        type: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        description: '',
        documentUuid: 'fake-uuid',
      },
      [],
    );

    expect(mockPlanningReviewService.getDetailedReview).toHaveBeenCalledTimes(
      1,
    );
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].planningReview).toBe(
      mockPlanningReview,
    );
    expect(mockRepository.save.mock.calls[0][0].typeCode).toEqual(
      DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
    );
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
  });

  it('should delete the existing file and create a new when updating', async () => {
    mockRepository.findOne.mockResolvedValue(
      new PlanningReviewDocument({
        document: new Document(),
      }),
    );
    mockPlanningReviewService.getFileNumber.mockResolvedValue(
      mockPlanningReview,
    );
    mockRepository.save.mockResolvedValue(new PlanningReviewDocument());
    mockDocumentService.create.mockResolvedValue(new Document());
    mockDocumentService.softRemove.mockResolvedValue();

    await service.update({
      source: DOCUMENT_SOURCE.APPLICANT,
      fileName: 'fileName',
      user: new User(),
      file: {} as File,
      uuid: '',
      documentType: DOCUMENT_TYPE.DECISION_DOCUMENT,
      visibilityFlags: [],
    });

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewService.getFileNumber).toHaveBeenCalledTimes(1);
    expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should load and save the documents with the new sort order', async () => {
    const mockDoc1 = new PlanningReviewDocument({
      uuid: 'uuid-1',
      evidentiaryRecordSorting: 5,
    });
    const mockDoc2 = new PlanningReviewDocument({
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
