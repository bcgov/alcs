import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationService } from '../../application/application.service';
import { CodeService } from '../../code/code.service';
import { ApplicationDecisionProfile } from '../../common/automapper/application-decision.automapper.profile';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { UserProfile } from '../../common/automapper/user.automapper.profile';
import {
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationModification } from '../application-modification/application-modification.entity';
import { ApplicationModificationService } from '../application-modification/application-modification.service';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { DecisionOutcomeCode } from './application-decision-outcome.entity';
import { ApplicationDecisionController } from './application-decision.controller';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecisionService } from './application-decision.service';

describe('ApplicationDecisionController', () => {
  let controller: ApplicationDecisionController;
  let mockDecisionService: DeepMocked<ApplicationDecisionService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockModificationService: DeepMocked<ApplicationModificationService>;
  let mockReconService: DeepMocked<ApplicationReconsiderationService>;

  let mockApplication;
  let mockDecision;

  beforeEach(async () => {
    mockDecisionService = createMock();
    mockApplicationService = createMock();
    mockCodeService = createMock();
    mockModificationService = createMock();
    mockReconService = createMock();

    mockApplication = initApplicationMockEntity();
    mockDecision = initApplicationDecisionMock(mockApplication);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionController],
      providers: [
        ApplicationProfile,
        ApplicationDecisionProfile,
        UserProfile,
        {
          provide: ApplicationDecisionService,
          useValue: mockDecisionService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: ApplicationModificationService,
          useValue: mockModificationService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationDecisionController>(
      ApplicationDecisionController,
    );

    mockDecisionService.fetchCodes.mockResolvedValue({
      outcomes: [
        {
          code: 'decision-code',
          label: 'decision-label',
        } as DecisionOutcomeCode,
      ],
      ceoCriterion: [],
      decisionMakers: [],
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for application', async () => {
    mockDecisionService.getByAppFileNumber.mockResolvedValue([mockDecision]);

    const result = await controller.getByFileNumber('fake-number');

    expect(mockDecisionService.getByAppFileNumber).toBeCalledTimes(1);
    expect(result[0].uuid).toStrictEqual(mockDecision.uuid);
  });

  it('should get a specific decision', async () => {
    mockDecisionService.get.mockResolvedValue(mockDecision);
    const result = await controller.get('fake-uuid');

    expect(mockDecisionService.get).toBeCalledTimes(1);
    expect(result.uuid).toStrictEqual(mockDecision.uuid);
  });

  it('should call through for deletion', async () => {
    mockDecisionService.delete.mockResolvedValue({} as any);

    await controller.delete('fake-uuid');

    expect(mockDecisionService.delete).toBeCalledTimes(1);
    expect(mockDecisionService.delete).toBeCalledWith('fake-uuid');
  });

  it('should create the decision if application exists', async () => {
    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
    mockDecisionService.create.mockResolvedValue(mockDecision);

    const decisionToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: mockApplication.fileNumber,
      outcomeCode: 'outcome',
    } as CreateApplicationDecisionDto;

    await controller.create(decisionToCreate);

    expect(mockDecisionService.create).toBeCalledTimes(1);
    expect(mockDecisionService.create).toBeCalledWith(
      {
        applicationFileNumber: mockApplication.fileNumber,
        outcomeCode: 'outcome',
        date: decisionToCreate.date,
      },
      mockApplication,
      undefined,
      undefined,
    );
  });

  it('should load the linked modification for create', async () => {
    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
    mockDecisionService.create.mockResolvedValue(mockDecision);
    const mockModification = {} as ApplicationModification;
    mockModificationService.getByUuid.mockResolvedValue(mockModification);

    const decisionToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: mockApplication.fileNumber,
      outcomeCode: 'outcome',
      modifiesUuid: 'fake-modification',
    } as CreateApplicationDecisionDto;

    await controller.create(decisionToCreate);

    expect(mockModificationService.getByUuid).toBeCalledTimes(1);
    expect(mockDecisionService.create).toBeCalledTimes(1);
    expect(mockDecisionService.create).toBeCalledWith(
      {
        applicationFileNumber: mockApplication.fileNumber,
        outcomeCode: 'outcome',
        date: decisionToCreate.date,
        modifiesUuid: 'fake-modification',
      },
      mockApplication,
      mockModification,
      undefined,
    );
  });

  it('should load the linked reconsideration for create', async () => {
    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
    mockDecisionService.create.mockResolvedValue(mockDecision);
    const mockReconsideration = {} as ApplicationReconsideration;
    mockReconService.getByUuid.mockResolvedValue(mockReconsideration);

    const decisionToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: mockApplication.fileNumber,
      outcomeCode: 'outcome',
      reconsidersUuid: 'fake-recon',
    } as CreateApplicationDecisionDto;

    await controller.create(decisionToCreate);

    expect(mockReconService.getByUuid).toBeCalledTimes(1);
    expect(mockDecisionService.create).toBeCalledTimes(1);
    expect(mockDecisionService.create).toBeCalledWith(
      {
        applicationFileNumber: mockApplication.fileNumber,
        outcomeCode: 'outcome',
        date: decisionToCreate.date,
        reconsidersUuid: 'fake-recon',
      },
      mockApplication,
      undefined,
      mockReconsideration,
    );
  });

  it('should throw an exception when trying to create with both modification and recon', async () => {
    const decisionToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: mockApplication.fileNumber,
      outcomeCode: 'outcome',
      reconsidersUuid: 'fake-recon',
      modifiesUuid: 'fake-modification',
    } as CreateApplicationDecisionDto;

    const promise = controller.create(decisionToCreate);
    await expect(promise).rejects.toMatchObject(
      new BadRequestException(
        'Cannot create a Decision linked to both a modification and a reconsideration',
      ),
    );
  });

  it('should throw an exception when trying to update with both modification and recon', async () => {
    const updateDto = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: mockApplication.fileNumber,
      outcomeCode: 'outcome',
      reconsidersUuid: 'fake-recon',
      modifiesUuid: 'fake-modification',
    } as UpdateApplicationDecisionDto;

    const promise = controller.update('uuid', updateDto);
    await expect(promise).rejects.toMatchObject(
      new BadRequestException(
        'Cannot create a Decision linked to both a modification and a reconsideration',
      ),
    );
  });

  it('should update the decision', async () => {
    mockDecisionService.update.mockResolvedValue(mockDecision);
    const updates = {
      outcome: 'New Outcome',
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
    } as UpdateApplicationDecisionDto;

    await controller.update('fake-uuid', updates);

    expect(mockDecisionService.update).toBeCalledTimes(1);
    expect(mockDecisionService.update).toBeCalledWith(
      'fake-uuid',
      {
        outcome: 'New Outcome',
        date: updates.date,
      },
      undefined,
      undefined,
    );
  });

  it('should call through for attaching the document', async () => {
    mockDecisionService.attachDocument.mockResolvedValue({} as any);
    await controller.attachDocument('fake-uuid', {
      file: () => ({}),
      isMultipart: () => true,
      user: {
        entity: {},
      },
    });

    expect(mockDecisionService.attachDocument).toBeCalledTimes(1);
  });

  it('should throw an exception if there is no file for file upload', async () => {
    mockDecisionService.attachDocument.mockResolvedValue({} as any);
    const promise = controller.attachDocument('fake-uuid', {
      file: () => ({}),
      isMultipart: () => false,
      user: {
        entity: {},
      },
    });

    await expect(promise).rejects.toMatchObject(
      new Error('Request is not multipart'),
    );
  });

  it('should call through for getting download url', async () => {
    const fakeUrl = 'fake-url';
    mockDecisionService.getDownloadUrl.mockResolvedValue(fakeUrl);
    const res = await controller.getDownloadUrl('fake-uuid', 'document-uuid');

    expect(mockDecisionService.getDownloadUrl).toBeCalledTimes(1);
    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for getting open url', async () => {
    const fakeUrl = 'fake-url';
    mockDecisionService.getDownloadUrl.mockResolvedValue(fakeUrl);
    const res = await controller.getOpenUrl('fake-uuid', 'document-uuid');

    expect(mockDecisionService.getDownloadUrl).toBeCalledTimes(1);
    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for document deletion', async () => {
    mockDecisionService.deleteDocument.mockResolvedValue({} as any);
    await controller.deleteDocument('fake-uuid', 'document-uuid');

    expect(mockDecisionService.deleteDocument).toBeCalledTimes(1);
  });
});
