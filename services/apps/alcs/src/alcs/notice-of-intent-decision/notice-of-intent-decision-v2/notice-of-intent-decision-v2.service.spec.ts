import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentService } from '../../../document/document.service';
import { NOI_SUBMISSION_STATUS } from '../../notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntent } from '../../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecisionComponentType } from '../notice-of-intent-decision-component/notice-of-intent-decision-component-type.entity';
import { NoticeOfIntentDecisionComponentDto } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.dto';
import { NoticeOfIntentDecisionComponentService } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.service';
import { NoticeOfIntentDecisionConditionType } from '../notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import { NoticeOfIntentDecisionConditionService } from '../notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { NoticeOfIntentDecisionDocument } from '../notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from '../notice-of-intent-decision-outcome.entity';
import {
  CreateNoticeOfIntentDecisionDto,
  UpdateNoticeOfIntentDecisionDto,
} from '../notice-of-intent-decision.dto';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';
import { NoticeOfIntentDecisionV2Service } from './notice-of-intent-decision-v2.service';

describe('NoticeOfIntentDecisionV2Service', () => {
  let service: NoticeOfIntentDecisionV2Service;
  let mockDecisionRepository: DeepMocked<Repository<NoticeOfIntentDecision>>;
  let mockDecisionDocumentRepository: DeepMocked<
    Repository<NoticeOfIntentDecisionDocument>
  >;
  let mockDecisionOutcomeRepository: DeepMocked<
    Repository<NoticeOfIntentDecisionOutcome>
  >;
  let mockNoticeOfIntentService: DeepMocked<NoticeOfIntentService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockNoticeOfIntentDecisionComponentTypeRepository: DeepMocked<
    Repository<NoticeOfIntentDecisionComponentType>
  >;
  let mockDecisionComponentService: DeepMocked<NoticeOfIntentDecisionComponentService>;
  let mockDecisionConditionService: DeepMocked<NoticeOfIntentDecisionConditionService>;
  let mockNoticeOfIntentSubmissionStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;

  let mockNoticeOfIntent;
  let mockDecision;

  beforeEach(async () => {
    mockNoticeOfIntentService = createMock<NoticeOfIntentService>();
    mockDocumentService = createMock<DocumentService>();
    mockDecisionRepository = createMock<Repository<NoticeOfIntentDecision>>();
    mockDecisionDocumentRepository =
      createMock<Repository<NoticeOfIntentDecisionDocument>>();
    mockDecisionOutcomeRepository =
      createMock<Repository<NoticeOfIntentDecisionOutcome>>();
    mockNoticeOfIntentDecisionComponentTypeRepository = createMock();
    mockDecisionComponentService = createMock();
    mockDecisionConditionService = createMock();
    mockNoticeOfIntentSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoticeOfIntentDecisionV2Service,
        {
          provide: getRepositoryToken(NoticeOfIntentDecision),
          useValue: mockDecisionRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionDocument),
          useValue: mockDecisionDocumentRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionOutcome),
          useValue: mockDecisionOutcomeRepository,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoticeOfIntentService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionComponentType),
          useValue: mockNoticeOfIntentDecisionComponentTypeRepository,
        },
        {
          provide: NoticeOfIntentDecisionComponentService,
          useValue: mockDecisionComponentService,
        },
        {
          provide: NoticeOfIntentDecisionConditionService,
          useValue: mockDecisionConditionService,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionConditionType),
          useValue: mockNoticeOfIntentDecisionComponentTypeRepository,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNoticeOfIntentSubmissionStatusService,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentDecisionV2Service>(
      NoticeOfIntentDecisionV2Service,
    );

    mockNoticeOfIntent = new NoticeOfIntent({
      uuid: '1111-1111-1111-1111',
    });
    mockDecision = new NoticeOfIntentDecision({
      noticeOfIntent: mockNoticeOfIntent,
      documents: [],
    });

    mockDecisionRepository.find.mockResolvedValue([mockDecision]);
    mockDecisionRepository.findOne.mockResolvedValue(mockDecision);
    mockDecisionRepository.save.mockResolvedValue(mockDecision);

    mockDecisionDocumentRepository.find.mockResolvedValue([]);

    mockNoticeOfIntentService.getByFileNumber.mockResolvedValue(
      mockNoticeOfIntent,
    );
    mockNoticeOfIntentService.update.mockResolvedValue({} as any);
    mockNoticeOfIntentService.updateByUuid.mockResolvedValue({} as any);
    mockNoticeOfIntentService.getUuid.mockResolvedValue('uuid');

    mockDecisionOutcomeRepository.find.mockResolvedValue([]);
    mockDecisionOutcomeRepository.findOneOrFail.mockResolvedValue({} as any);

    mockNoticeOfIntentDecisionComponentTypeRepository.find.mockResolvedValue(
      [],
    );
    mockDecisionComponentService.createOrUpdate.mockResolvedValue([]);
    mockDecisionConditionService.remove.mockResolvedValue({} as any);
    mockNoticeOfIntentSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      {} as any,
    );
  });

  describe('NoticeOfIntentDecisionService Core Tests', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should get decisions by notice of intent', async () => {
      const result = await service.getByFileNumber(
        mockNoticeOfIntent.fileNumber,
      );

      expect(result).toStrictEqual([mockDecision]);
    });

    it('should return decisions by uuid', async () => {
      const result = await service.get(mockDecision.uuid);

      expect(result).toStrictEqual(mockDecision);
    });

    it('should delete decision with uuid and update notice of intent and submission status', async () => {
      mockDecisionRepository.softRemove.mockResolvedValue({} as any);
      mockDecisionRepository.findOne.mockResolvedValue({
        ...mockDecision,
        reconsiders: 'reconsider-uuid',
        modifies: 'modified-uuid',
      });
      mockDecisionRepository.find.mockResolvedValue([]);
      mockDecisionComponentService.softRemove.mockResolvedValue();

      await service.delete(mockDecision.uuid);

      expect(mockDecisionRepository.save.mock.calls[0][0].modifies).toBeNull();
      expect(mockDecisionRepository.softRemove).toBeCalledTimes(1);
      expect(mockNoticeOfIntentService.updateByUuid).toHaveBeenCalledTimes(1);
      expect(mockNoticeOfIntentService.updateByUuid).toHaveBeenCalledWith(
        mockNoticeOfIntent.uuid,
        {
          decisionDate: null,
        },
      );
      expect(
        mockNoticeOfIntentSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledTimes(1);
      expect(
        mockNoticeOfIntentSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledWith(
        mockNoticeOfIntent.fileNumber,
        NOI_SUBMISSION_STATUS.ALC_DECISION,
        null,
      );
    });

    it('should create a decision', async () => {
      mockDecisionRepository.find.mockResolvedValue([]);
      mockDecisionRepository.findOne.mockResolvedValue({
        documents: [] as NoticeOfIntentDecisionDocument[],
      } as NoticeOfIntentDecision);
      mockDecisionRepository.exist.mockResolvedValue(false);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        date: decisionDate.getTime(),
        fileNumber: 'file-number',
        outcomeCode: 'Outcome',
        isDraft: true,
      } as CreateNoticeOfIntentDecisionDto;

      await service.create(decisionToCreate, mockNoticeOfIntent, undefined);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockNoticeOfIntentService.update).toHaveBeenCalledTimes(0);
    });

    it('should fail create a decision if the resolution number is already in use', async () => {
      mockDecisionRepository.findOne.mockResolvedValue(
        {} as NoticeOfIntentDecision,
      );
      mockDecisionRepository.exist.mockResolvedValueOnce(false);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        resolutionNumber: 1,
        resolutionYear: 1,
        date: decisionDate.getTime(),
        fileNumber: 'file-number',
        outcomeCode: 'Outcome',
        isDraft: true,
      } as CreateNoticeOfIntentDecisionDto;

      await expect(
        service.create(decisionToCreate, mockNoticeOfIntent, undefined),
      ).rejects.toMatchObject(
        new ServiceValidationException(
          `Resolution number #${decisionToCreate.resolutionNumber}/${decisionToCreate.resolutionYear} is already in use`,
        ),
      );

      expect(mockDecisionRepository.save).toBeCalledTimes(0);
      expect(mockNoticeOfIntentService.update).toHaveBeenCalledTimes(0);
    });

    it('should fail create a draft decision if draft already exists', async () => {
      mockDecisionRepository.findOne.mockResolvedValue({
        documents: [] as NoticeOfIntentDecisionDocument[],
      } as NoticeOfIntentDecision);
      mockDecisionRepository.exist.mockResolvedValueOnce(true);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        resolutionNumber: 1,
        resolutionYear: 1,
        date: decisionDate.getTime(),
        fileNumber: 'file-number',
        outcomeCode: 'Outcome',
        isDraft: true,
      } as CreateNoticeOfIntentDecisionDto;

      await expect(
        service.create(decisionToCreate, mockNoticeOfIntent, undefined),
      ).rejects.toMatchObject(
        new ServiceValidationException(
          'Draft decision already exists for this notice of intent.',
        ),
      );

      expect(mockDecisionRepository.save).toBeCalledTimes(0);
      expect(mockNoticeOfIntentService.update).toHaveBeenCalledTimes(0);
    });

    it('should create a decision and NOT update the notice of intent if this was the second decision', async () => {
      mockDecisionRepository.findOne.mockResolvedValue({
        documents: [] as NoticeOfIntentDecisionDocument[],
      } as NoticeOfIntentDecision);
      mockDecisionRepository.exist.mockResolvedValueOnce(false);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        date: decisionDate.getTime(),
        fileNumber: 'file-number',
        outcomeCode: 'Outcome',
      } as CreateNoticeOfIntentDecisionDto;

      await service.create(decisionToCreate, mockNoticeOfIntent, undefined);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockNoticeOfIntentService.update).not.toHaveBeenCalled();
      expect(
        mockNoticeOfIntentSubmissionStatusService.setStatusDateByFileNumber,
      ).not.toHaveBeenCalled();
    });

    it('should update the decision and update the notice of intent and submission status if it was the only decision', async () => {
      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate: UpdateNoticeOfIntentDecisionDto = {
        date: decisionDate.getTime(),
        outcomeCode: 'New Outcome',
        isDraft: false,
        decisionComponents: [
          {
            uuid: 'fake',
            alrArea: 1,
            agCap: '1',
            agCapSource: '1',
            noticeOfIntentDecisionComponentTypeCode: 'fake',
          },
        ] as NoticeOfIntentDecisionComponentDto[],
      };

      const createdDecision = new NoticeOfIntentDecision({
        date: decisionDate,
        documents: [],
      });

      mockDecisionRepository.find.mockResolvedValue([createdDecision]);

      await service.update(mockDecision.uuid, decisionUpdate, undefined);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toHaveBeenCalledTimes(1);
      expect(mockNoticeOfIntentService.updateByUuid).toHaveBeenCalledTimes(1);
      expect(mockNoticeOfIntentService.updateByUuid).toHaveBeenCalledWith(
        mockNoticeOfIntent.uuid,
        {
          decisionDate,
        },
      );
      expect(
        mockNoticeOfIntentSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledTimes(1);
      expect(
        mockNoticeOfIntentSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledWith(
        mockNoticeOfIntent.fileNumber,
        NOI_SUBMISSION_STATUS.ALC_DECISION,
        decisionDate,
      );
    });

    it('should update decision and update the notice of intent date to null if it is draft decision', async () => {
      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate: UpdateNoticeOfIntentDecisionDto = {
        date: decisionDate.getTime(),
        outcomeCode: 'New Outcome',
        isDraft: true,
      };

      await service.update(mockDecision.uuid, decisionUpdate, undefined);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockNoticeOfIntentService.updateByUuid).toHaveBeenCalledTimes(1);
      expect(mockNoticeOfIntentService.updateByUuid).toBeCalledWith(
        '1111-1111-1111-1111',
        {
          decisionDate: null,
        },
      );
      expect(
        mockNoticeOfIntentSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledTimes(1);
      expect(
        mockNoticeOfIntentSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledWith(
        mockNoticeOfIntent.fileNumber,
        NOI_SUBMISSION_STATUS.ALC_DECISION,
        null,
      );
    });

    it('should not update the notice of intent dates when updating a draft decision', async () => {
      const secondDecision = new NoticeOfIntentDecision({
        noticeOfIntent: mockNoticeOfIntent,
        documents: [],
      });
      secondDecision.isDraft = true;
      secondDecision.uuid = 'second-uuid';
      mockDecisionRepository.find.mockResolvedValue([
        secondDecision,
        mockDecision,
      ]);
      mockDecisionRepository.findOne.mockResolvedValue(secondDecision);

      const decisionUpdate: UpdateNoticeOfIntentDecisionDto = {
        outcomeCode: 'New Outcome',
        isDraft: true,
      };

      await service.update(mockDecision.uuid, decisionUpdate, undefined);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockNoticeOfIntentService.update).not.toHaveBeenCalled();
      expect(
        mockNoticeOfIntentSubmissionStatusService.setStatusDateByFileNumber,
      ).not.toHaveBeenCalled();
    });

    it('should fail on update if the decision is not found', async () => {
      const nonExistantUuid = 'bad-uuid';
      mockDecisionRepository.findOne.mockResolvedValue(null);
      const decisionUpdate: UpdateNoticeOfIntentDecisionDto = {
        date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
        outcomeCode: 'New Outcome',
        isDraft: true,
      };
      const promise = service.update(
        nonExistantUuid,
        decisionUpdate,
        undefined,
      );

      await expect(promise).rejects.toMatchObject(
        new ServiceNotFoundException(
          `Decision with UUID ${nonExistantUuid} not found`,
        ),
      );
      expect(mockDecisionRepository.save).toBeCalledTimes(0);
    });

    it('should call through for get code', async () => {
      await service.fetchCodes();
      expect(mockDecisionOutcomeRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should call through for get for applicant', async () => {
      await service.getForPortal('');
      expect(mockDecisionRepository.find).toHaveBeenCalledTimes(1);
      expect(mockNoticeOfIntentService.getUuid).toHaveBeenCalledTimes(1);
    });
  });

  describe('NoticeOfIntentDecisionService File Tests', () => {
    let mockDocument;
    beforeEach(() => {
      mockDecisionDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockDecisionDocumentRepository.save.mockResolvedValue(mockDocument);

      mockDocument = {
        uuid: 'fake-uuid',
        decisionUuid: 'decision-uuid',
      } as NoticeOfIntentDecisionDocument;
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
