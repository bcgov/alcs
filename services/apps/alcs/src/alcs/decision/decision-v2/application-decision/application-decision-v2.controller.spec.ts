import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import {
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationProfile } from '../../../../common/automapper/application.automapper.profile';
import { UserProfile } from '../../../../common/automapper/user.automapper.profile';
import { ApplicationService } from '../../../application/application.service';
import { CodeService } from '../../../code/code.service';
import { DecisionOutcomeCode } from '../../application-decision-outcome.entity';
import { ApplicationDecisionV2Controller } from './application-decision-v2.controller';
import { ApplicationDecisionV2Service } from './application-decision-v2.service';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';

describe('ApplicationDecisionV2Controller', () => {
  let controller: ApplicationDecisionV2Controller;
  let mockDecisionService: DeepMocked<ApplicationDecisionV2Service>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockCodeService: DeepMocked<CodeService>;

  let mockApplication;
  let mockDecision;

  beforeEach(async () => {
    mockDecisionService = createMock();
    mockApplicationService = createMock();
    mockCodeService = createMock();

    mockApplication = initApplicationMockEntity();
    mockDecision = initApplicationDecisionMock(mockApplication);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionV2Controller],
      providers: [
        ApplicationProfile,
        ApplicationDecisionProfile,
        UserProfile,
        {
          provide: ApplicationDecisionV2Service,
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
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationDecisionV2Controller>(
      ApplicationDecisionV2Controller,
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
      null,
      null,
    );
  });

  it('should call through for attaching the document', async () => {
    mockDecisionService.attachDocument.mockResolvedValue({} as any);
    await controller.attachDocument('fake-uuid', {
      isMultipart: () => true,
      body: {
        file: {},
      },
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
