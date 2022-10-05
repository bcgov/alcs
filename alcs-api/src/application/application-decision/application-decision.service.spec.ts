import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionProfile } from '../../common/automapper/application-decision.automapper.profile';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import {
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import { DocumentService } from '../../document/document.service';
import { ApplicationService } from '../application.service';
import { ApplicationDecisionOutcomeType } from './application-decision-outcome.entity';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecision } from './application-decision.entity';
import { ApplicationDecisionService } from './application-decision.service';
import { DecisionDocument } from './decision-document.entity';

describe('ApplicationDecisionService', () => {
  let service: ApplicationDecisionService;
  let mockDecisionRepository: DeepMocked<Repository<ApplicationDecision>>;
  let mockDecisionDocumentRepository: DeepMocked<Repository<DecisionDocument>>;
  let mockDecisionOutcomeRepository: DeepMocked<
    Repository<ApplicationDecisionOutcomeType>
  >;
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
      createMock<Repository<ApplicationDecisionOutcomeType>>();

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
          provide: getRepositoryToken(ApplicationDecisionOutcomeType),
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
    mockApplicationService.createOrUpdate.mockResolvedValue({} as any);

    mockDecisionOutcomeRepository.find.mockResolvedValue([]);
    mockDecisionOutcomeRepository.findOne.mockResolvedValue(undefined);
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
      expect(mockApplicationService.createOrUpdate).toHaveBeenCalled();
      expect(mockApplicationService.createOrUpdate).toHaveBeenCalledWith({
        fileNumber: mockApplication.fileNumber,
        decisionDate: null,
      });
    });

    it('should create a decision and update the application if this was the first decision', async () => {
      mockDecisionRepository.find.mockResolvedValue([]);

      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const meetingToCreate = {
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcome: 'Outcome',
      } as CreateApplicationDecisionDto;

      await service.create(meetingToCreate, mockApplication);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.createOrUpdate).toHaveBeenCalled();
      expect(mockApplicationService.createOrUpdate).toHaveBeenCalledWith({
        fileNumber: mockApplication.fileNumber,
        decisionDate,
      });
    });

    it('should create a decision and NOT update the application if this was the second decision', async () => {
      const decisionDate = new Date(2022, 2, 2, 2, 2, 2, 2);
      const meetingToCreate = {
        date: decisionDate.getTime(),
        applicationFileNumber: 'file-number',
        outcome: 'Outcome',
      } as CreateApplicationDecisionDto;

      await service.create(meetingToCreate, mockApplication);

      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.createOrUpdate).not.toHaveBeenCalled();
    });

    it('should update the decision and update the application if it was the only decision', async () => {
      const decisionDate = new Date(2022, 3, 3, 3, 3, 3, 3);
      const decisionUpdate = {
        date: decisionDate.getTime(),
        outcome: 'New Outcome',
      } as UpdateApplicationDecisionDto;

      await service.update(mockDecision.uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.createOrUpdate).toHaveBeenCalled();
      expect(mockApplicationService.createOrUpdate).toHaveBeenCalledWith({
        fileNumber: mockApplication.fileNumber,
        decisionDate,
      });
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
      const decisionUpdate = {
        date: decisionDate.getTime(),
        outcome: 'New Outcome',
      } as UpdateApplicationDecisionDto;

      await service.update(mockDecision.uuid, decisionUpdate);

      expect(mockDecisionRepository.findOne).toBeCalledTimes(2);
      expect(mockDecisionRepository.save).toBeCalledTimes(1);
      expect(mockApplicationService.createOrUpdate).not.toHaveBeenCalled();
    });

    it('should fail on update if the decision is not found', async () => {
      const nonExistantUuid = 'bad-uuid';
      mockDecisionRepository.findOne.mockReturnValue(undefined);
      const decisionUpdate = {
        date: new Date(2022, 2, 2, 2, 2, 2, 2).getTime(),
        outcome: 'New Outcome',
      } as UpdateApplicationDecisionDto;

      expect(mockDecisionRepository.save).toBeCalledTimes(0);
      await expect(
        service.update(nonExistantUuid, decisionUpdate),
      ).rejects.toMatchObject(
        new ServiceNotFoundException(
          `Decison Meeting with UUID ${nonExistantUuid} not found`,
        ),
      );
    });

    it('should call through for get code', async () => {
      await service.getCodeMapping();
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
