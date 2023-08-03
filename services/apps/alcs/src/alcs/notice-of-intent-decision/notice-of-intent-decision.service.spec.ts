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
import { DocumentService } from '../../document/document.service';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecisionDocument } from './notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from './notice-of-intent-decision-outcome.entity';
import {
  CreateNoticeOfIntentDecisionDto,
  UpdateNoticeOfIntentDecisionDto,
} from './notice-of-intent-decision.dto';
import { NoticeOfIntentDecision } from './notice-of-intent-decision.entity';
import { NoticeOfIntentDecisionService } from './notice-of-intent-decision.service';

describe('NoticeOfIntentDecisionService', () => {
  let service: NoticeOfIntentDecisionService;
  let mockDecisionRepository: DeepMocked<Repository<NoticeOfIntentDecision>>;
  let mockDecisionDocumentRepository: DeepMocked<
    Repository<NoticeOfIntentDecisionDocument>
  >;
  let mockDecisionOutcomeRepository: DeepMocked<
    Repository<NoticeOfIntentDecisionOutcome>
  >;
  let mockNOIService: DeepMocked<NoticeOfIntentService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  let mockNOI;
  let mockDecision;

  beforeEach(async () => {
    mockNOIService = createMock<NoticeOfIntentService>();
    mockDocumentService = createMock<DocumentService>();
    mockDecisionRepository = createMock<Repository<NoticeOfIntentDecision>>();
    mockDecisionDocumentRepository =
      createMock<Repository<NoticeOfIntentDecisionDocument>>();
    mockDecisionOutcomeRepository =
      createMock<Repository<NoticeOfIntentDecisionOutcome>>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoticeOfIntentDecisionService,
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
          useValue: mockNOIService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentDecisionService>(
      NoticeOfIntentDecisionService,
    );

    mockNOI = new NoticeOfIntent({
      fileNumber: '1',
    });
    mockDecision = new NoticeOfIntentDecision({
      noticeOfIntent: mockNOI,
      documents: [],
    });

    mockDecisionRepository.find.mockResolvedValue([mockDecision]);
    mockDecisionRepository.findOne.mockResolvedValue(mockDecision);
    mockDecisionRepository.save.mockResolvedValue(mockDecision);

    mockDecisionDocumentRepository.find.mockResolvedValue([]);

    mockNOIService.getOrFailByUuid.mockResolvedValue(mockNOI);
    mockNOIService.getByFileNumber.mockResolvedValue(mockNOI);
    mockNOIService.update.mockResolvedValue({} as any);
    mockNOIService.updateByUuid.mockResolvedValue({} as any);

    mockDecisionOutcomeRepository.find.mockResolvedValue([]);
    mockDecisionOutcomeRepository.findOneOrFail.mockResolvedValue({} as any);
  });

  describe('NoticeOfIntentDecisionService Core Tests', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should get decisions by notice of intent', async () => {
      const result = await service.getByFileNumber(mockNOI.fileNumber);

      expect(result).toStrictEqual([mockDecision]);
    });

    it('should return decisions by uuid', async () => {
      const result = await service.get(mockDecision.uuid);

      expect(result).toStrictEqual(mockDecision);
    });

    it('should delete decision with uuid and update the noi', async () => {
      mockDecisionRepository.softRemove.mockResolvedValue({} as any);
      mockDecisionRepository.findOne.mockResolvedValue({
        ...mockDecision,
        reconsiders: 'reconsider-uuid',
        modifies: 'modified-uuid',
      });
      mockDecisionRepository.find.mockResolvedValue([]);

      await service.delete(mockDecision.uuid);
      expect(mockDecisionRepository.softRemove).toBeCalledTimes(1);
      expect(mockNOIService.updateByUuid).toHaveBeenCalledTimes(1);
      expect(mockNOIService.updateByUuid).toHaveBeenCalledWith(mockNOI.uuid, {
        decisionDate: null,
      });
    });

    it('should create a decision and update the noi if this was the first decision', async () => {
      mockDecisionRepository.find.mockResolvedValue([]);
      mockDecisionRepository.findOne.mockResolvedValueOnce(null);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcomeCode: 'Outcome',
      } as CreateNoticeOfIntentDecisionDto;

      await service.create(decisionToCreate, mockNOI, null);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockNOIService.updateByUuid).toHaveBeenCalledTimes(1);
      expect(mockNOIService.updateByUuid).toHaveBeenCalledWith(mockNOI.uuid, {
        decisionDate,
      });
    });

    it('should fail create a decision and update application if the resolution number is already in use', async () => {
      mockDecisionRepository.findOne.mockResolvedValue(
        {} as NoticeOfIntentDecision,
      );

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        resolutionNumber: 1,
        resolutionYear: 1,
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcomeCode: 'Outcome',
      } as CreateNoticeOfIntentDecisionDto;

      await expect(
        service.create(decisionToCreate, mockNOI, null),
      ).rejects.toMatchObject(
        new ServiceValidationException(
          `Resolution number #${decisionToCreate.resolutionNumber}/${decisionToCreate.resolutionYear} is already in use`,
        ),
      );

      expect(mockDecisionRepository.save).toBeCalledTimes(0);
      expect(mockNOIService.update).toHaveBeenCalledTimes(0);
    });

    it('should create a decision and NOT update the application if this was the second decision', async () => {
      mockDecisionRepository.findOne.mockResolvedValueOnce(null);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcomeCode: 'Outcome',
      } as CreateNoticeOfIntentDecisionDto;

      await service.create(decisionToCreate, mockNOI, null);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockNOIService.update).not.toHaveBeenCalled();
    });

    it('should update the decision and update the application if it was the only decision', async () => {
      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate: UpdateNoticeOfIntentDecisionDto = {
        date: decisionDate.getTime(),
        outcomeCode: 'New Outcome',
      };

      await service.update(mockDecision.uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockNOIService.updateByUuid).toHaveBeenCalledTimes(1);
      expect(mockNOIService.updateByUuid).toHaveBeenCalledWith(mockNOI.uuid, {
        decisionDate,
      });
    });

    it('should not update the noi if this was not the first decision', async () => {
      const secondDecision = new NoticeOfIntentDecision({
        noticeOfIntent: mockNOI,
      });
      secondDecision.uuid = 'second-uuid';
      mockDecisionRepository.find.mockResolvedValue([
        secondDecision,
        mockDecision,
      ]);
      mockDecisionRepository.findOne.mockResolvedValue(secondDecision);

      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate: UpdateNoticeOfIntentDecisionDto = {
        date: decisionDate.getTime(),
        outcomeCode: 'New Outcome',
      };

      await service.update(mockDecision.uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockNOIService.update).not.toHaveBeenCalled();
    });

    it('should fail on update if the decision is not found', async () => {
      const nonExistantUuid = 'bad-uuid';
      mockDecisionRepository.findOne.mockResolvedValue(null);
      const decisionUpdate: UpdateNoticeOfIntentDecisionDto = {
        date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
        outcomeCode: 'New Outcome',
      };
      const promise = service.update(nonExistantUuid, decisionUpdate);

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
  });

  describe('ApplicationDecisionService File Tests', () => {
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
