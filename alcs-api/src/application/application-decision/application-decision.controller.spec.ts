import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { application } from 'express';
import { ClsService } from 'nestjs-cls';
import { Board } from '../../board/board.entity';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { UserProfile } from '../../common/automapper/user.automapper.profile';
import {
  initApplicationDecisionMeetingMock,
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationCodeService } from '../application-code/application-code.service';
import { ApplicationService } from '../application.service';
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
  let mockApplicationCodeService: DeepMocked<ApplicationCodeService>;

  beforeEach(async () => {
    mockDecisionService = createMock<ApplicationDecisionService>();
    mockApplicationService = createMock<ApplicationService>();
    mockApplicationCodeService = createMock<ApplicationCodeService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionController, ApplicationProfile],
      providers: [
        ApplicationProfile,
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
          provide: ApplicationCodeService,
          useValue: mockApplicationCodeService,
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
    expect(result[0].uuid).toStrictEqual(mockDecision.uuid);
  });

  it('should get a specific meeting', async () => {
    const mockApplication = initApplicationMockEntity();
    const mockDecision = initApplicationDecisionMock(mockApplication);
    mockDecisionService.get.mockResolvedValue(mockDecision);
    const result = await controller.get('fake-uuid');

    expect(mockDecisionService.get).toBeCalledTimes(1);
    expect(result.uuid).toStrictEqual(mockDecision.uuid);
  });

  it('should delete meeting', async () => {
    mockDecisionService.delete.mockReturnValue({} as any);

    await controller.delete('fake-uuid');

    expect(mockDecisionService.delete).toBeCalledTimes(1);
    expect(mockDecisionService.delete).toBeCalledWith('fake-uuid');
  });

  it('should create meeting if application exists', async () => {
    const appMock = initApplicationMockEntity();
    const mockDecision = initApplicationDecisionMock(appMock);
    mockApplicationService.get.mockResolvedValue(appMock);
    mockDecisionService.create.mockResolvedValue(mockDecision);
    mockApplicationCodeService = createMock<ApplicationCodeService>();

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
});
