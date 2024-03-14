import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { DocumentService } from '../../../document/document.service';
import { PlanningReview } from '../planning-review.entity';
import { PlanningReviewService } from '../planning-review.service';
import { PlanningReviewDecisionDocument } from './planning-review-decision-document/planning-review-decision-document.entity';
import { PlanningReviewDecisionOutcomeCode } from './planning-review-decision-outcome.entity';
import {
  CreatePlanningReviewDecisionDto,
  UpdatePlanningReviewDecisionDto,
} from './planning-review-decision.dto';
import { PlanningReviewDecision } from './planning-review-decision.entity';
import { PlanningReviewDecisionService } from './planning-review-decision.service';

describe('PlanningReviewDecisionService', () => {
  let service: PlanningReviewDecisionService;
  let mockDecisionRepository: DeepMocked<Repository<PlanningReviewDecision>>;
  let mockDecisionDocumentRepository: DeepMocked<
    Repository<PlanningReviewDecisionDocument>
  >;
  let mockDecisionOutcomeRepository: DeepMocked<
    Repository<PlanningReviewDecisionOutcomeCode>
  >;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockPlanningReviewService: DeepMocked<PlanningReviewService>;
  const mockFileNumber = '125';
  let mockPlanningReview;
  let mockDecision;

  beforeEach(async () => {
    mockDocumentService = createMock();
    mockDecisionRepository = createMock();
    mockDecisionDocumentRepository = createMock();
    mockDecisionOutcomeRepository = createMock();
    mockPlanningReviewService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        PlanningReviewDecisionService,
        {
          provide: getRepositoryToken(PlanningReviewDecision),
          useValue: mockDecisionRepository,
        },
        {
          provide: getRepositoryToken(PlanningReviewDecisionDocument),
          useValue: mockDecisionDocumentRepository,
        },
        {
          provide: getRepositoryToken(PlanningReviewDecisionOutcomeCode),
          useValue: mockDecisionOutcomeRepository,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: PlanningReviewService,
          useValue: mockPlanningReviewService,
        },
      ],
    }).compile();

    service = module.get<PlanningReviewDecisionService>(
      PlanningReviewDecisionService,
    );

    mockPlanningReview = new PlanningReview({
      uuid: v4(),
      fileNumber: mockFileNumber,
    });
    mockDecision = new PlanningReviewDecision({
      planningReview: mockPlanningReview,
      documents: [],
    });

    mockDecisionRepository.find.mockResolvedValue([mockDecision]);
    mockDecisionRepository.findOne.mockResolvedValue(mockDecision);
    mockDecisionRepository.findOneOrFail(mockDecision);
    mockDecisionRepository.save.mockResolvedValue(mockDecision);

    mockDecisionDocumentRepository.find.mockResolvedValue([]);

    mockPlanningReviewService.getByFileNumber.mockResolvedValue(
      mockPlanningReview,
    );
    mockPlanningReviewService.update.mockResolvedValue({} as any);

    mockDecisionOutcomeRepository.find.mockResolvedValue([]);
    mockDecisionOutcomeRepository.findOneOrFail.mockResolvedValue({} as any);
  });

  describe('PlanningReviewDecisionService Core Tests', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should get decisions by file number', async () => {
      const result = await service.getByFileNumber(
        mockPlanningReview.fileNumber,
      );

      expect(result).toStrictEqual([mockDecision]);
    });

    it('should return decisions by uuid', async () => {
      const result = await service.get(mockDecision.uuid);

      expect(result).toStrictEqual(mockDecision);
    });

    it('should delete decision with uuid and update planning review', async () => {
      mockDecisionRepository.softRemove.mockResolvedValue({} as any);
      mockDecisionRepository.findOne.mockResolvedValue({
        ...mockDecision,
        reconsiders: 'reconsider-uuid',
        modifies: 'modified-uuid',
      });
      mockDecisionRepository.find.mockResolvedValue([]);

      await service.delete(mockDecision.uuid);

      expect(mockDecisionRepository.softRemove).toBeCalledTimes(1);
      expect(mockPlanningReviewService.update).toHaveBeenCalledTimes(1);
      expect(mockPlanningReviewService.update).toHaveBeenCalledWith(
        mockPlanningReview.fileNumber,
        {
          decisionDate: null,
        },
      );
    });

    it('should create a decision', async () => {
      mockDecisionRepository.exists.mockResolvedValue(false);
      mockPlanningReviewService.getByFileNumber.mockResolvedValue(
        new PlanningReview(),
      );

      const decisionToCreate: CreatePlanningReviewDecisionDto = {
        planningReviewFileNumber: '',
      };

      await service.create(decisionToCreate);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockPlanningReviewService.update).toHaveBeenCalledTimes(0);
    });

    it('should fail create a draft decision if draft already exists', async () => {
      mockDecisionRepository.findOne.mockResolvedValue(
        new PlanningReviewDecision({
          documents: [],
        }),
      );
      mockDecisionRepository.exists.mockResolvedValueOnce(true);

      const decisionToCreate: CreatePlanningReviewDecisionDto = {
        planningReviewFileNumber: '',
      };

      await expect(service.create(decisionToCreate)).rejects.toMatchObject(
        new ServiceValidationException(
          'Draft decision already exists for this planning review.',
        ),
      );

      expect(mockDecisionRepository.save).toBeCalledTimes(0);
      expect(mockPlanningReviewService.update).toHaveBeenCalledTimes(0);
    });

    it('should create a decision and NOT update the planning review if this was the second decision', async () => {
      mockDecisionRepository.findOne.mockResolvedValue({
        documents: [] as PlanningReviewDecisionDocument[],
      } as PlanningReviewDecision);
      mockDecisionRepository.exists.mockResolvedValueOnce(false);

      const decisionToCreate: CreatePlanningReviewDecisionDto = {
        planningReviewFileNumber: '',
      };

      await service.create(decisionToCreate);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockPlanningReviewService.update).not.toHaveBeenCalled();
    });

    it('should update the decision and update the planning review if it was the only decision', async () => {
      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate: UpdatePlanningReviewDecisionDto = {
        date: decisionDate.getTime(),
        outcomeCode: 'New Outcome',
        isDraft: false,
      };

      const createdDecision = new PlanningReviewDecision({
        date: decisionDate,
        isDraft: false,
        documents: [],
      });

      mockDecisionRepository.findOne.mockResolvedValue(createdDecision);
      mockDecisionRepository.find.mockResolvedValue([createdDecision]);

      await service.update(mockDecision.uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toHaveBeenCalledTimes(1);
      expect(mockPlanningReviewService.update).toHaveBeenCalledTimes(1);
      expect(mockPlanningReviewService.update).toHaveBeenCalledWith(
        mockPlanningReview.fileNumber,
        {
          decisionDate: decisionDate.getTime(),
        },
      );
    });

    it('should update decision and update the planning review date to null if it is draft decision', async () => {
      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate: UpdatePlanningReviewDecisionDto = {
        date: decisionDate.getTime(),
        outcomeCode: 'New Outcome',
        isDraft: true,
      };

      await service.update(mockDecision.uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockPlanningReviewService.update).toHaveBeenCalledTimes(1);
      expect(mockPlanningReviewService.update).toHaveBeenCalledWith(
        mockFileNumber,
        {
          decisionDate: null,
        },
      );
    });

    it('should not update the planning review dates when updating a draft decision', async () => {
      const secondDecision = new PlanningReviewDecision({
        ...mockPlanningReview,
        documents: [],
      });
      secondDecision.isDraft = true;
      secondDecision.uuid = 'second-uuid';
      mockDecisionRepository.find.mockResolvedValue([
        secondDecision,
        mockDecision,
      ]);
      mockDecisionRepository.findOne.mockResolvedValue(secondDecision);

      const decisionUpdate: UpdatePlanningReviewDecisionDto = {
        outcomeCode: 'New Outcome',
        isDraft: true,
      };

      await service.update(mockDecision.uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockPlanningReviewService.update).not.toHaveBeenCalled();
    });

    it('should call through for get code', async () => {
      await service.fetchCodes();
      expect(mockDecisionOutcomeRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('PlanningReviewDecisionService File Tests', () => {
    let mockDocument;
    beforeEach(() => {
      mockDecisionDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockDecisionDocumentRepository.save.mockResolvedValue(mockDocument);

      mockDocument = {
        uuid: 'fake-uuid',
        decisionUuid: 'decision-uuid',
      } as PlanningReviewDecisionDocument;
    });

    it('should call the repository for attaching a file', async () => {
      mockDocumentService.create.mockResolvedValue({} as any);

      await service.attachDocument('uuid', {} as any, {} as any);
      expect(mockDecisionDocumentRepository.save).toHaveBeenCalledTimes(1);
      expect(mockDocumentService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception when attaching a document to a non-existent decision', async () => {
      mockDecisionRepository.findOne.mockResolvedValue(null);
      await expect(
        service.attachDocument('uuid', {} as any, {} as any),
      ).rejects.toMatchObject(
        new ServiceNotFoundException(`Decision with UUID uuid not found`),
      );
      expect(mockDocumentService.create).not.toHaveBeenCalled();
    });

    it('should call the repository to delete documents', async () => {
      mockDecisionDocumentRepository.softRemove.mockResolvedValue({} as any);

      await service.deleteDocument('fake-uuid');
      expect(mockDecisionDocumentRepository.softRemove).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should call the repository to check if portal user can download document', async () => {
      mockDecisionDocumentRepository.findOne.mockResolvedValue(
        new PlanningReviewDecisionDocument(),
      );
      mockDocumentService.getDownloadUrl.mockResolvedValue('');

      await service.getDownloadForPortal('fake-uuid');
      expect(mockDecisionDocumentRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockDocumentService.getDownloadUrl).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception when document not found for deletion', async () => {
      mockDecisionDocumentRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteDocument('fake-uuid')).rejects.toMatchObject(
        new ServiceNotFoundException(
          `Failed to find document with uuid fake-uuid`,
        ),
      );
      expect(mockDocumentService.softRemove).not.toHaveBeenCalled();
    });

    it('should call through to document service for update', async () => {
      mockDocumentService.update.mockResolvedValue({} as any);

      await service.updateDocument('document-uuid', 'file-name');
      expect(mockDocumentService.update).toHaveBeenCalledTimes(1);
    });

    it('should call through to document service for download', async () => {
      const downloadUrl = 'download-url';
      mockDocumentService.getDownloadUrl.mockResolvedValue(downloadUrl);

      const res = await service.getDownloadUrl('fake-uuid');

      expect(mockDocumentService.getDownloadUrl).toHaveBeenCalledTimes(1);
      expect(res).toEqual(downloadUrl);
    });

    it('should throw an exception when document not found for download', async () => {
      mockDecisionDocumentRepository.findOne.mockResolvedValue(null);
      await expect(service.getDownloadUrl('fake-uuid')).rejects.toMatchObject(
        new ServiceNotFoundException(
          `Failed to find document with uuid fake-uuid`,
        ),
      );
    });
  });
});
