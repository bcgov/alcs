import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import {
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import { DocumentService } from '../../document/document.service';
import { ApplicationService } from '../application.service';
import { DecisionOutcomeCode } from './application-decision-outcome.entity';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecision } from './application-decision.entity';
import { ApplicationDecisionService } from './application-decision.service';
import { CeoCriterionCode } from './ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from './decision-document.entity';
import { DecisionMakerCode } from './decision-maker/decision-maker.entity';

describe('ApplicationDecisionService', () => {
  let service: ApplicationDecisionService;
  let mockDecisionRepository: DeepMocked<Repository<ApplicationDecision>>;
  let mockDecisionDocumentRepository: DeepMocked<Repository<DecisionDocument>>;
  let mockDecisionOutcomeRepository: DeepMocked<
    Repository<DecisionOutcomeCode>
  >;
  let mockDecisionMakerCodeRepository: DeepMocked<
    Repository<DecisionMakerCode>
  >;
  let mockCeoCriterionCodeRepository: DeepMocked<Repository<CeoCriterionCode>>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  let mockApplication;
  let mockDecision;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();
    mockDocumentService = createMock<DocumentService>();
    mockDecisionRepository = createMock<Repository<ApplicationDecision>>();
    mockDecisionDocumentRepository = createMock<Repository<DecisionDocument>>();
    mockDecisionOutcomeRepository =
      createMock<Repository<DecisionOutcomeCode>>();
    mockDecisionMakerCodeRepository =
      createMock<Repository<DecisionMakerCode>>();
    mockCeoCriterionCodeRepository = createMock<Repository<CeoCriterionCode>>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationDecisionService,
        {
          provide: getRepositoryToken(ApplicationDecision),
          useValue: mockDecisionRepository,
        },
        {
          provide: getRepositoryToken(DecisionDocument),
          useValue: mockDecisionDocumentRepository,
        },
        {
          provide: getRepositoryToken(DecisionMakerCode),
          useValue: mockDecisionMakerCodeRepository,
        },
        {
          provide: getRepositoryToken(CeoCriterionCode),
          useValue: mockCeoCriterionCodeRepository,
        },
        {
          provide: getRepositoryToken(DecisionOutcomeCode),
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
      ],
    }).compile();

    service = module.get<ApplicationDecisionService>(
      ApplicationDecisionService,
    );

    mockApplication = initApplicationMockEntity();
    mockDecision = initApplicationDecisionMock(mockApplication);

    mockDecisionRepository.find.mockResolvedValue([mockDecision]);
    mockDecisionRepository.findOne.mockResolvedValue(mockDecision);
    mockDecisionRepository.save.mockResolvedValue(mockDecision);

    mockApplicationService.get.mockResolvedValue(mockApplication);
    mockApplicationService.update.mockResolvedValue({} as any);
    mockApplicationService.updateByUuid.mockResolvedValue({} as any);

    mockDecisionOutcomeRepository.find.mockResolvedValue([]);
    mockDecisionOutcomeRepository.findOne.mockResolvedValue(undefined);

    mockDecisionMakerCodeRepository.find.mockResolvedValue([]);
    mockCeoCriterionCodeRepository.find.mockResolvedValue([]);
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

    it('should fail on get decisions if application does not exist', async () => {
      mockApplicationService.get.mockResolvedValue(null);

      await expect(
        service.getByAppFileNumber('fake-file-number'),
      ).rejects.toMatchObject(
        new ServiceNotFoundException(
          'Application with provided number not found fake-file-number',
        ),
      );
    });

    it('should return decisions by uuid', async () => {
      const result = await service.get(mockDecision.uuid);

      expect(result).toStrictEqual(mockDecision);
    });

    it('should delete meeting with uuid and update application', async () => {
      mockDecisionRepository.softRemove.mockResolvedValue({} as any);
      mockDecisionRepository.find.mockResolvedValue([]);

      await service.delete(mockDecision.uuid);

      expect(mockDecisionRepository.softRemove).toBeCalledTimes(1);
      expect(mockApplicationService.update).toHaveBeenCalled();
      expect(mockApplicationService.update).toHaveBeenCalledWith(
        mockApplication,
        {
          decisionDate: null,
        },
      );
    });

    it('should create a decision and update the application if this was the first decision', async () => {
      mockDecisionRepository.find.mockResolvedValue([]);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const meetingToCreate = {
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcomeCode: 'Outcome',
      } as CreateApplicationDecisionDto;

      await service.create(meetingToCreate, mockApplication);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.update).toHaveBeenCalled();
      expect(mockApplicationService.update).toHaveBeenCalledWith(
        mockApplication,
        {
          decisionDate,
        },
      );
    });

    it('should create a decision and NOT update the application if this was the second decision', async () => {
      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const meetingToCreate = {
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcomeCode: 'Outcome',
      } as CreateApplicationDecisionDto;

      await service.create(meetingToCreate, mockApplication);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.update).not.toHaveBeenCalled();
    });

    it('should update the decision and update the application if it was the only decision', async () => {
      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate: UpdateApplicationDecisionDto = {
        date: decisionDate.getTime(),
        outcomeCode: 'New Outcome',
      };

      await service.update(mockDecision.uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.updateByUuid).toHaveBeenCalled();
      expect(mockApplicationService.updateByUuid).toHaveBeenCalledWith(
        mockApplication.uuid,
        {
          decisionDate,
        },
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

      await service.update(mockDecision.uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.update).not.toHaveBeenCalled();
    });

    it('should fail on update if the decision is not found', async () => {
      const nonExistantUuid = 'bad-uuid';
      mockDecisionRepository.findOne.mockReturnValue(undefined);
      const decisionUpdate: UpdateApplicationDecisionDto = {
        date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
        outcomeCode: 'New Outcome',
      };

      await expect(
        service.update(nonExistantUuid, decisionUpdate),
      ).rejects.toMatchObject(
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

      await expect(service.update(uuid, decisionUpdate)).rejects.toMatchObject(
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

      await service.update(uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
    });

    it('should fail on update if trying to set time extension when ceo criterion is not correct', async () => {
      const uuid = 'uuid';
      const decisionUpdate: UpdateApplicationDecisionDto = {
        isTimeExtension: true,
      };

      expect(mockDecisionRepository.save).toBeCalledTimes(0);
      await expect(service.update(uuid, decisionUpdate)).rejects.toMatchObject(
        new ServiceValidationException(
          `Cannot set time extension unless ceo criterion is modification`,
        ),
      );
    });

    it('should call through for get code', async () => {
      await service.fetchCodes();
      expect(mockDecisionOutcomeRepository.find).toHaveBeenCalled();
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
      } as DecisionDocument;
    });

    it('should call the repository for attaching a file', async () => {
      mockDocumentService.create.mockResolvedValue({} as any);

      await service.attachDocument('uuid', {} as any, {} as any);
      expect(mockDecisionDocumentRepository.save).toHaveBeenCalled();
      expect(mockDocumentService.create).toHaveBeenCalled();
    });

    it('should throw an exception when attaching a document to a non-existent decision', async () => {
      mockDecisionRepository.findOne.mockResolvedValue(undefined);
      await expect(
        service.attachDocument('uuid', {} as any, {} as any),
      ).rejects.toMatchObject(
        new ServiceNotFoundException(`Decision not found uuid`),
      );
      expect(mockDocumentService.create).not.toHaveBeenCalled();
    });

    it('should call the repository to delete', async () => {
      mockDocumentService.softRemove.mockResolvedValue({} as any);

      await service.deleteDocument('fake-uuid');
      expect(mockDocumentService.softRemove).toHaveBeenCalled();
    });

    it('should throw an exception when document not found for deletion', async () => {
      mockDecisionDocumentRepository.findOne.mockResolvedValue(undefined);
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

      expect(mockDocumentService.getDownloadUrl).toHaveBeenCalled();
      expect(res).toEqual(downloadUrl);
    });

    it('should throw an exception when document not found for download', async () => {
      mockDecisionDocumentRepository.findOne.mockResolvedValue(undefined);
      await expect(service.getDownloadUrl('fake-uuid')).rejects.toMatchObject(
        new ServiceNotFoundException(
          `Failed to find document with uuid fake-uuid`,
        ),
      );
    });
  });
});
