import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { CodeService } from '../../code/code.service';
import { ApplicationDecisionProfile } from '../../common/automapper/application-decision.automapper.profile';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { UserProfile } from '../../common/automapper/user.automapper.profile';
import {
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationService } from '../application.service';
import { ApplicationDecisionOutcomeType } from './application-decision-outcome.entity';
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

  beforeEach(async () => {
    mockDecisionService = createMock<ApplicationDecisionService>();
    mockApplicationService = createMock<ApplicationService>();
    mockCodeService = createMock<CodeService>();

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
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationDecisionController>(
      ApplicationDecisionController,
    );

    mockDecisionService.getCodeMapping.mockResolvedValue([
      {
        uuid: 'code-uuid',
        code: 'decision-code',
        label: 'decision-label',
      } as ApplicationDecisionOutcomeType,
    ]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for application', async () => {
    const mockApplication = initApplicationMockEntity();
    const mockDecision = initApplicationDecisionMock(mockApplication);
    mockDecisionService.getByAppFileNumber.mockResolvedValue([mockDecision]);

    const result = await controller.getAllForApplication('fake-number');

    expect(mockDecisionService.getByAppFileNumber).toBeCalledTimes(1);
    expect(result.decisions[0].uuid).toStrictEqual(mockDecision.uuid);
  });

  it('should get a specific decision', async () => {
    const mockApplication = initApplicationMockEntity();
    const mockDecision = initApplicationDecisionMock(mockApplication);
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
    const appMock = initApplicationMockEntity();
    const mockDecision = initApplicationDecisionMock(appMock);
    mockApplicationService.get.mockResolvedValue(appMock);
    mockDecisionService.create.mockResolvedValue(mockDecision);

    const decisionToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: appMock.fileNumber,
      outcome: 'outcome',
    } as CreateApplicationDecisionDto;

    await controller.create(decisionToCreate);

    expect(mockDecisionService.create).toBeCalledTimes(1);
    expect(mockDecisionService.create).toBeCalledWith(
      {
        applicationFileNumber: appMock.fileNumber,
        outcome: 'outcome',
        date: decisionToCreate.date,
      },
      appMock,
    );
  });

  it('should fail create meeting if application does not exist', async () => {
    mockApplicationService.get.mockReturnValue(undefined);

    await expect(
      controller.create({
        applicationFileNumber: 'fake-number',
      } as CreateApplicationDecisionDto),
    ).rejects.toMatchObject(
      new NotFoundException('Application not found fake-number'),
    );

    expect(mockDecisionService.create).toBeCalledTimes(0);
  });

  it('should update the decision', async () => {
    const appMock = initApplicationMockEntity();
    const mockDecision = initApplicationDecisionMock(appMock);
    mockDecisionService.update.mockResolvedValue(mockDecision);
    const updates = {
      outcome: 'New Outcome',
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
    } as UpdateApplicationDecisionDto;

    await controller.update('fake-uuid', updates);

    expect(mockDecisionService.update).toBeCalledTimes(1);
    expect(mockDecisionService.update).toBeCalledWith('fake-uuid', {
      outcome: 'New Outcome',
      date: updates.date,
    });
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
