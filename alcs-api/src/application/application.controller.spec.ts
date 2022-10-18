import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardSmallDto } from '../board/board.dto';
import { CardStatusDto } from '../card/card-status/card-status.dto';
import { CardStatus } from '../card/card-status/card-status.entity';
import { CardDto } from '../card/card.dto';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeService } from '../code/code.service';
import { RoleGuard } from '../common/authorization/role.guard';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { ConfigModule } from '../common/config/config.module';
import {
  initApplicationMockEntity,
  initAssigneeMockDto,
} from '../common/utils/test-helpers/mockEntities';
import {
  mockKeyCloakProviders,
  repositoryMockFactory,
} from '../common/utils/test-helpers/mockTypes';
import { NotificationService } from '../notification/notification.service';
import { ApplicationTimeData } from './application-time-tracking.service';
import { ApplicationController } from './application.controller';
import { ApplicationDto, UpdateApplicationDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

jest.mock('../common/authorization/role.guard', () => ({
  RoleGuard: createMock<RoleGuard>(),
}));

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: DeepMocked<ApplicationService>;
  let codeService: DeepMocked<CodeService>;
  let notificationService: DeepMocked<NotificationService>;
  let cardService: DeepMocked<CardService>;
  const mockApplicationEntity = initApplicationMockEntity();

  const mockApplicationDto: ApplicationDto = {
    fileNumber: mockApplicationEntity.fileNumber,
    applicant: mockApplicationEntity.applicant,
    status: mockApplicationEntity.card.status.code,
    type: mockApplicationEntity.type.code,
    assigneeUuid: mockApplicationEntity.card.assigneeUuid,
    board: undefined,
    region: undefined,
    localGovernment: {
      uuid: 'fake',
      name: 'Local Government',
      preferredRegionCode: 'fake',
    },
    activeDays: 2,
    pausedDays: 0,
    paused: false,
    highPriority: mockApplicationEntity.card.highPriority,
    decisionMeetings: [],
    dateReceived: Date.now(),
    card: {
      assignee: initAssigneeMockDto(),
      status: {} as CardStatusDto,
      type: 'fake',
      uuid: 'fake',
      highPriority: false,
      board: {} as BoardSmallDto,
    } as CardDto,
  };

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();
    codeService = createMock<CodeService>();
    notificationService = createMock<NotificationService>();
    cardService = createMock<CardService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        ApplicationProfile,
        UserProfile,
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: CodeService,
          useValue: codeService,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: CardService,
          useValue: cardService,
        },
        {
          provide: getRepositoryToken(Application),
          useFactory: repositoryMockFactory,
        },
        ...mockKeyCloakProviders,
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
        ConfigModule,
      ],
    }).compile();
    codeService.fetchCardStatus.mockResolvedValue(createMock<CardStatus>());
    controller = module.get<ApplicationController>(ApplicationController);

    const mockTimesMap = new Map<string, ApplicationTimeData>();
    mockTimesMap.set(mockApplicationEntity.uuid, {
      activeDays: 2,
      pausedDays: 0,
    });

    applicationService.mapToDtos.mockResolvedValue([mockApplicationDto]);
    notificationService.createNotificationForApplication.mockResolvedValue();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delete', async () => {
    applicationService.delete.mockResolvedValue();
    const applicationNumberToDelete = 'app_1';
    await controller.softDelete(applicationNumberToDelete);

    expect(applicationService.delete).toHaveBeenCalledTimes(1);
    expect(applicationService.delete).toHaveBeenCalledWith(
      applicationNumberToDelete,
    );
  });

  it('should return the entity after create', async () => {
    applicationService.create.mockResolvedValue(mockApplicationEntity);

    codeService.fetchApplicationType.mockResolvedValue({
      uuid: 'fake-uuid',
      code: 'fake-code',
    } as ApplicationType);

    const res = await controller.create({
      ...mockApplicationDto,
      localGovernmentUuid: 'government-uuid',
    });

    expect(applicationService.create).toHaveBeenCalledTimes(1);
    expect(res).toStrictEqual(mockApplicationDto);
  });

  it('should update only the given fields', async () => {
    const fileNumber = '11';
    const mockUpdate = {
      applicant: 'New Applicant',
    } as UpdateApplicationDto;

    applicationService.getOrFail.mockResolvedValue(mockApplicationEntity);

    applicationService.update.mockResolvedValue({
      ...mockApplicationEntity,
      fileNumber: fileNumber,
      applicant: mockUpdate.applicant,
    } as Application);
    applicationService.mapToDtos.mockResolvedValue([
      {
        applicant: mockUpdate.applicant,
      } as unknown as ApplicationDto,
    ]);

    const res = await controller.update(fileNumber, mockUpdate);

    expect(res.applicant).toEqual(mockUpdate.applicant);
    expect(applicationService.update).toHaveBeenCalledTimes(1);
    expect(
      notificationService.createNotificationForApplication,
    ).not.toHaveBeenCalled();
    expect(applicationService.update).toHaveBeenCalledWith(
      mockApplicationEntity,
      mockUpdate,
    );
  });

  it('should handle updating application and not include status', async () => {
    const mockStatus = 'NEW_STATUS';
    const mockUuid = 'uuid';
    const fileNumber = '11';
    const mockUpdate = {
      status: mockStatus,
      cardUuid: 'fake',
    };

    codeService.fetchCardStatus.mockResolvedValue({
      uuid: mockUuid,
      code: mockStatus,
    } as CardStatus);
    applicationService.getOrFail.mockResolvedValue(mockApplicationEntity);
    applicationService.update.mockResolvedValue({
      ...mockApplicationEntity,
      card: {
        ...mockApplicationEntity.card,
        status: {
          code: mockStatus,
          label: '',
          description: '',
        },
      },
    } as Application);

    await controller.update(fileNumber, mockUpdate);

    expect(applicationService.update).toHaveBeenCalledTimes(1);
  });

  it('should handle updating type', async () => {
    const mockType = 'NEW_STATUS';
    const mockUuid = 'uuid';
    const fileNumber = '11';
    const mockUpdate = {
      type: mockType,
    };

    codeService.fetchApplicationType.mockResolvedValue({
      uuid: mockUuid,
      code: mockType,
    } as ApplicationType);
    applicationService.getOrFail.mockResolvedValue(mockApplicationEntity);
    applicationService.update.mockResolvedValue({
      ...mockApplicationEntity,
      type: {
        code: mockType,
        label: '',
        description: '',
      },
    } as Application);

    await controller.update(fileNumber, mockUpdate);

    expect(applicationService.update).toHaveBeenCalledTimes(1);
    const savedData = applicationService.update.mock.calls[0][1];
    expect(savedData.typeUuid).toEqual(mockUuid);
  });

  it('should handle updating region', async () => {
    const mockRegion = 'NEW_REGION';
    const mockUuid = 'uuid';
    const fileNumber = '11';
    const mockUpdate = {
      fileNumber: '11',
      region: mockRegion,
      cardUuid: 'fake',
    };

    codeService.fetchRegion.mockResolvedValue({
      uuid: mockUuid,
      code: mockRegion,
    } as ApplicationType);
    applicationService.getOrFail.mockResolvedValue(mockApplicationEntity);
    applicationService.update.mockResolvedValue({
      ...mockApplicationEntity,
      region: {
        code: mockRegion,
        label: '',
        description: '',
      },
    } as Application);

    await controller.update(fileNumber, mockUpdate);

    expect(applicationService.update).toBeCalledTimes(1);
    expect(codeService.fetchRegion).toBeCalledTimes(1);
    const savedData = applicationService.update.mock.calls[0][1];
    expect(savedData.regionUuid).toEqual(mockUuid);
  });

  it('should call notification service when assignee is changed', async () => {
    const mockUserUuid = 'fake-user';
    const mockUpdate = {
      assigneeUuid: mockUserUuid,
    };

    const fakeAuthor = {
      uuid: 'fake-author',
    };

    applicationService.getOrFail.mockResolvedValue({
      ...mockApplicationEntity,
    } as Application);
    applicationService.getByCard.mockResolvedValue({
      ...mockApplicationEntity,
    } as Application);

    const updatedCard = { ...mockApplicationEntity.card } as Card;
    updatedCard.assigneeUuid = mockUserUuid;
    cardService.get.mockResolvedValue(mockApplicationEntity.card);
    cardService.update.mockResolvedValue(updatedCard);

    await controller.updateCard('fake', mockUpdate, {
      user: {
        entity: fakeAuthor,
      },
    });

    expect(cardService.update).toHaveBeenCalledTimes(1);
    expect(
      notificationService.createNotificationForApplication,
    ).toHaveBeenCalledTimes(1);
    const savedData = cardService.update.mock.calls[0][1];
    expect(savedData.assigneeUuid).toEqual(mockUserUuid);

    const createNotificationServiceDto =
      notificationService.createNotificationForApplication.mock.calls[0][0];
    expect(createNotificationServiceDto.actor).toStrictEqual(fakeAuthor);
    expect(createNotificationServiceDto.receiverUuid).toStrictEqual(
      mockUserUuid,
    );
    expect(createNotificationServiceDto.title).toStrictEqual(
      "You've been assigned",
    );
    expect(createNotificationServiceDto.body).toStrictEqual(
      `${mockApplicationEntity.fileNumber} (${mockApplicationEntity.applicant})`,
    );
    expect(createNotificationServiceDto.targetType).toStrictEqual(
      'application',
    );
  });

  it('should not update card entity even if passed', async () => {
    const mockUserUuid = 'fake-author';
    const mockUpdate = {
      assigneeUuid: mockUserUuid,
    };

    const returnedApplication = mockApplicationEntity;
    returnedApplication.card.assigneeUuid = mockUserUuid;

    applicationService.getOrFail.mockResolvedValue(mockApplicationEntity);
    applicationService.update.mockResolvedValue(returnedApplication);

    await controller.update('11', mockUpdate);

    expect(applicationService.update).toHaveBeenCalledTimes(1);
    expect(notificationService.createForApplication).not.toHaveBeenCalled();
  });

  it('should throw service validation exceptions on update if card/application does not exist', async () => {
    const mockUserUuid = 'fake-user';
    const cardUuid = 'fake-card-uuid';
    const mockUpdate = {
      assigneeUuid: mockUserUuid,
    };

    const fakeAuthor = {
      uuid: 'fake-author',
    };

    applicationService.getOrFail.mockResolvedValue({} as Application);
    cardService.get.mockResolvedValue(undefined);

    await expect(
      controller.updateCard(cardUuid, mockUpdate, {
        user: {
          entity: fakeAuthor,
        },
      }),
    ).rejects.toMatchObject(new Error(`Card ${cardUuid} not found`));

    expect(cardService.update).toBeCalledTimes(0);
    expect(notificationService.createForApplication).toBeCalledTimes(0);
  });

  it('should update card status if it changed', async () => {
    const mockUserUuid = 'fake-user';
    const mockStatus = 'NEW_STATUS';
    const mockUuid = 'uuid';

    const mockUpdate = {
      fileNumber: '11',
      assigneeUuid: mockUserUuid,
      status: mockStatus,
      cardUuid: mockApplicationEntity.card.uuid,
    };

    applicationService.getOrFail.mockResolvedValue({
      ...mockApplicationEntity,
    } as Application);
    codeService.fetchCardStatus.mockResolvedValue({
      uuid: mockUuid,
      code: mockStatus,
    } as CardStatus);
    cardService.get.mockResolvedValue(mockApplicationEntity.card);
    cardService.update.mockResolvedValue(mockApplicationEntity.card);

    const updatedCard = {
      assigneeUuid: 'fake',
      status: { code: mockStatus },
    } as Card;
    cardService.update.mockResolvedValue(updatedCard);
    applicationService.getByCard.mockResolvedValue({
      ...mockApplicationEntity,
      card: updatedCard,
    } as Application);

    const result = await controller.updateCard(
      mockApplicationEntity.card.uuid,
      mockUpdate,
      {
        user: { entity: { uuid: 'fake' } },
      },
    );

    expect(cardService.update).toBeCalledTimes(1);
    expect(codeService.fetchCardStatus).toBeCalledTimes(1);
    expect(result.statusDetails.code).toStrictEqual(updatedCard.status.code);
  });
});
