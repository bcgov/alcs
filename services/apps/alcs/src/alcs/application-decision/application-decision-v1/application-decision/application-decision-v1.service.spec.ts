import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../../../../test/mocks/mockEntities';
import { ApplicationSubmissionStatusService } from '../../../application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../application/application-submission-status/submission-status.dto';
import { DocumentService } from '../../../../document/document.service';
import { ApplicationService } from '../../../application/application.service';
import { ApplicationCeoCriterionCode } from '../../application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionDocument } from '../../application-decision-document/application-decision-document.entity';
import { ApplicationDecisionMakerCode } from '../../application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionOutcomeCode } from '../../application-decision-outcome.entity';
import { ApplicationDecision } from '../../application-decision.entity';
import { ApplicationDecisionV1Service } from './application-decision-v1.service';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';

describe('ApplicationDecisionV1Service', () => {
  let service: ApplicationDecisionV1Service;
  let mockDecisionRepository: DeepMocked<Repository<ApplicationDecision>>;
  let mockDecisionDocumentRepository: DeepMocked<
    Repository<ApplicationDecisionDocument>
  >;
  let mockDecisionOutcomeRepository: DeepMocked<
    Repository<ApplicationDecisionOutcomeCode>
  >;
  let mockDecisionMakerCodeRepository: DeepMocked<
    Repository<ApplicationDecisionMakerCode>
  >;
  let mockCeoCriterionCodeRepository: DeepMocked<
    Repository<ApplicationCeoCriterionCode>
  >;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;

  let mockApplication;
  let mockDecision;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();
    mockDocumentService = createMock<DocumentService>();
    mockDecisionRepository = createMock<Repository<ApplicationDecision>>();
    mockDecisionDocumentRepository =
      createMock<Repository<ApplicationDecisionDocument>>();
    mockDecisionOutcomeRepository =
      createMock<Repository<ApplicationDecisionOutcomeCode>>();
    mockDecisionMakerCodeRepository =
      createMock<Repository<ApplicationDecisionMakerCode>>();
    mockCeoCriterionCodeRepository =
      createMock<Repository<ApplicationCeoCriterionCode>>();
    mockApplicationSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationDecisionV1Service,
        {
          provide: getRepositoryToken(ApplicationDecision),
          useValue: mockDecisionRepository,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionDocument),
          useValue: mockDecisionDocumentRepository,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionMakerCode),
          useValue: mockDecisionMakerCodeRepository,
        },
        {
          provide: getRepositoryToken(ApplicationCeoCriterionCode),
          useValue: mockCeoCriterionCodeRepository,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionOutcomeCode),
          useValue: mockDecisionOutcomeRepository,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionV1Service>(
      ApplicationDecisionV1Service,
    );

    mockApplication = initApplicationMockEntity();
    mockDecision = initApplicationDecisionMock(mockApplication);

    mockDecisionRepository.find.mockResolvedValue([mockDecision]);
    mockDecisionRepository.findOne.mockResolvedValue(mockDecision);
    mockDecisionRepository.save.mockResolvedValue(mockDecision);

    mockDecisionDocumentRepository.find.mockResolvedValue([]);

    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
    mockApplicationService.update.mockResolvedValue({} as any);
    mockApplicationService.updateByUuid.mockResolvedValue({} as any);

    mockDecisionOutcomeRepository.find.mockResolvedValue([]);
    mockDecisionOutcomeRepository.findOneOrFail.mockResolvedValue({} as any);

    mockDecisionMakerCodeRepository.find.mockResolvedValue([]);
    mockCeoCriterionCodeRepository.find.mockResolvedValue([]);

    mockApplicationSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      {} as any,
    );
  });

  describe('ApplicationDecisionService Core Tests', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should get decisions by application', async () => {
      const result = await service.getByAppFileNumber(
        mockApplication.fileNumber,
      );

      expect(result).toStrictEqual([mockDecision]);
    });

    it('should return decisions by uuid', async () => {
      const result = await service.get(mockDecision.uuid);

      expect(result).toStrictEqual(mockDecision);
    });

    it('should delete decision with uuid and update application and submission status', async () => {
      mockDecisionRepository.softRemove.mockResolvedValue({} as any);
      mockDecisionRepository.findOne.mockResolvedValue({
        ...mockDecision,
        reconsiders: 'reconsider-uuid',
        modifies: 'modified-uuid',
      });
      mockDecisionRepository.find.mockResolvedValue([]);

      await service.delete(mockDecision.uuid);

      expect(mockDecisionRepository.save.mock.calls[0][0].modifies).toBeNull();
      expect(
        mockDecisionRepository.save.mock.calls[0][0].reconsiders,
      ).toBeNull();
      expect(mockDecisionRepository.softRemove).toBeCalledTimes(1);
      expect(mockApplicationService.update).toHaveBeenCalledTimes(1);
      expect(mockApplicationService.update).toHaveBeenCalledWith(
        mockApplication,
        {
          decisionDate: null,
        },
      );
      expect(
        mockApplicationSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledTimes(1);
      expect(
        mockApplicationSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledWith(
        mockApplication.fileNumber,
        SUBMISSION_STATUS.ALC_DECISION,
        null,
      );
    });

    it('should create a decision and update the application if this was the first decision', async () => {
      mockDecisionRepository.find.mockResolvedValue([]);
      mockDecisionRepository.findOne.mockResolvedValueOnce(null);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcomeCode: 'Outcome',
      } as CreateApplicationDecisionDto;

      await service.create(
        decisionToCreate,
        mockApplication,
        undefined,
        undefined,
      );

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.update).toHaveBeenCalledTimes(1);
      expect(mockApplicationService.update).toHaveBeenCalledWith(
        mockApplication,
        {
          decisionDate,
        },
      );
    });

    it('should fail create a decision and update application if the resolution number is already in use', async () => {
      mockDecisionRepository.findOne.mockResolvedValue(
        {} as ApplicationDecision,
      );

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        resolutionNumber: 1,
        resolutionYear: 1,
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcomeCode: 'Outcome',
      } as CreateApplicationDecisionDto;

      await expect(
        service.create(decisionToCreate, mockApplication, undefined, undefined),
      ).rejects.toMatchObject(
        new ServiceValidationException(
          `Resolution number #${decisionToCreate.resolutionNumber}/${decisionToCreate.resolutionYear} is already in use`,
        ),
      );

      expect(mockDecisionRepository.save).toBeCalledTimes(0);
      expect(mockApplicationService.update).toHaveBeenCalledTimes(0);
    });

    it('should create a decision and NOT update the application if this was the second decision', async () => {
      mockDecisionRepository.findOne.mockResolvedValueOnce(null);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const decisionToCreate = {
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcomeCode: 'Outcome',
      } as CreateApplicationDecisionDto;

      await service.create(
        decisionToCreate,
        mockApplication,
        undefined,
        undefined,
      );

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.update).not.toHaveBeenCalled();
    });

    it('should update the decision and update the application and submission status if it was the only decision', async () => {
      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate: UpdateApplicationDecisionDto = {
        date: decisionDate.getTime(),
        outcomeCode: 'New Outcome',
      };

      await service.update(
        mockDecision.uuid,
        decisionUpdate,
        undefined,
        undefined,
      );

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.updateByUuid).toHaveBeenCalledTimes(1);
      expect(mockApplicationService.updateByUuid).toHaveBeenCalledWith(
        mockApplication.uuid,
        {
          decisionDate,
        },
      );
      expect(
        mockApplicationSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledTimes(1);
      expect(
        mockApplicationSubmissionStatusService.setStatusDateByFileNumber,
      ).toBeCalledWith(
        mockApplication.fileNumber,
        SUBMISSION_STATUS.ALC_DECISION,
        decisionDate,
      );
    });

    it('should not update the application if this was not the first decision', async () => {
      const secondDecision = initApplicationDecisionMock(mockApplication);
      secondDecision.uuid = 'second-uuid';
      mockDecisionRepository.find.mockResolvedValue([
        secondDecision,
        mockDecision,
      ]);
      mockDecisionRepository.findOne.mockResolvedValue(secondDecision);

      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate: UpdateApplicationDecisionDto = {
        date: decisionDate.getTime(),
        outcomeCode: 'New Outcome',
      };

      await service.update(
        mockDecision.uuid,
        decisionUpdate,
        undefined,
        undefined,
      );

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.update).not.toHaveBeenCalled();
    });

    it('should fail on update if the decision is not found', async () => {
      const nonExistantUuid = 'bad-uuid';
      mockDecisionRepository.findOne.mockResolvedValue(null);
      const decisionUpdate: UpdateApplicationDecisionDto = {
        date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
        outcomeCode: 'New Outcome',
      };
      const promise = service.update(
        nonExistantUuid,
        decisionUpdate,
        undefined,
        undefined,
      );

      await expect(promise).rejects.toMatchObject(
        new ServiceNotFoundException(
          `Decision with UUID ${nonExistantUuid} not found`,
        ),
      );
      expect(mockDecisionRepository.save).toBeCalledTimes(0);
    });

    it('should fail on update if trying to set ceo criterion but decision maker is not CEO', async () => {
      const uuid = 'uuid';
      const decisionUpdate: UpdateApplicationDecisionDto = {
        ceoCriterionCode: 'fake-code',
      };

      const promise = service.update(
        uuid,
        decisionUpdate,
        undefined,
        undefined,
      );

      await expect(promise).rejects.toMatchObject(
        new ServiceValidationException(
          `Cannot set ceo criterion code unless ceo the decision maker`,
        ),
      );
      expect(mockDecisionRepository.save).toBeCalledTimes(0);
    });

    it('should allow updating the ceo criterion and decision maker to CEO', async () => {
      const uuid = 'uuid';
      const decisionUpdate: UpdateApplicationDecisionDto = {
        ceoCriterionCode: 'fake-code',
        decisionMakerCode: 'CEOP',
      };

      await service.update(uuid, decisionUpdate, undefined, undefined);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
    });

    it('should fail on update if trying to set time extension when ceo criterion is not correct', async () => {
      const uuid = 'uuid';
      const decisionUpdate: UpdateApplicationDecisionDto = {
        isTimeExtension: true,
      };

      const promise = service.update(
        uuid,
        decisionUpdate,
        undefined,
        undefined,
      );

      await expect(promise).rejects.toMatchObject(
        new ServiceValidationException(
          `Cannot set time extension unless ceo criterion is modification`,
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
      } as ApplicationDecisionDocument;
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
