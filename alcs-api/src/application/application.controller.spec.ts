import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { BoardSmallDto } from '../board/board.dto';
import { CardStatusDto } from '../card/card-status/card-status.dto';
import { CardDto } from '../card/card.dto';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { ConfigModule } from '../common/config/config.module';
import {
  initApplicationMockEntity,
  initMockAssigneeDto,
} from '../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { NotificationService } from '../notification/notification.service';
import { ApplicationTimeData } from './application-time-tracking.service';
import { ApplicationController } from './application.controller';
import { ApplicationDto, UpdateApplicationDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: DeepMocked<ApplicationService>;
  let notificationService: DeepMocked<NotificationService>;
  let cardService: DeepMocked<CardService>;
  const mockApplicationEntity = initApplicationMockEntity();

  const mockApplicationDto: ApplicationDto = {
    summary: 'summary',
    fileNumber: mockApplicationEntity.fileNumber,
    applicant: mockApplicationEntity.applicant,
    type: mockApplicationEntity.type,
    region: {
      code: 'region-code',
      label: 'region-label',
      description: 'region-description',
    },
    localGovernment: {
      uuid: 'fake',
      name: 'Local Government',
      preferredRegionCode: 'fake',
    },
    activeDays: 2,
    pausedDays: 0,
    paused: false,
    decisionMeetings: [],
    dateReceived: Date.now(),
    card: {
      assignee: initMockAssigneeDto(),
      status: {} as CardStatusDto,
      type: 'fake',
      uuid: 'fake',
      highPriority: false,
      board: {} as BoardSmallDto,
    } as CardDto,
  };

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();
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
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: CardService,
          useValue: cardService,
        },
        {
          provide: ClsService,
          useValue: {},
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

    const res = await controller.create({
      ...mockApplicationDto,
      dateReceived: mockApplicationDto.dateReceived!,
      localGovernmentUuid: 'government-uuid',
      typeCode: 'fake-code',
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
      } as ApplicationDto,
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
    const fileNumber = '11';
    const mockUpdate = {
      status: mockStatus,
      cardUuid: 'fake',
    } as UpdateApplicationDto;

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
    const fileNumber = '11';
    const mockUpdate: UpdateApplicationDto = {
      typeCode: mockType,
    };

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
    expect(savedData.typeCode).toEqual(mockType);
  });

  it('should handle updating region', async () => {
    const mockRegion = 'NEW_REGION';
    const fileNumber = '11';
    const mockUpdate: UpdateApplicationDto = {
      regionCode: mockRegion,
    };

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
    const savedData = applicationService.update.mock.calls[0][1];
    expect(savedData.regionCode).toEqual(mockRegion);
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
    returnedApplication.card!.assigneeUuid = mockUserUuid;

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
    cardService.get.mockResolvedValue(null);

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

    const mockUpdate: UpdateApplicationDto = {
      assigneeUuid: mockUserUuid,
      statusCode: mockStatus,
    };

    applicationService.getOrFail.mockResolvedValue({
      ...mockApplicationEntity,
    } as Application);
    cardService.get.mockResolvedValue(mockApplicationEntity.card);
    cardService.update.mockResolvedValue(mockApplicationEntity.card!);

    const updatedCard = {
      assigneeUuid: 'fake',
      status: { code: mockStatus },
    } as Card;
    cardService.update.mockResolvedValue(updatedCard);
    applicationService.getByCard.mockResolvedValue({
      ...mockApplicationEntity,
      card: updatedCard,
    } as Application);

    applicationService.mapToDtos.mockResolvedValue([
      {
        card: {
          status: {
            code: mockStatus,
          },
        },
      } as ApplicationDto,
    ]);

    const result = await controller.updateCard(
      mockApplicationEntity.card!.uuid,
      mockUpdate,
      {
        user: { entity: { uuid: 'fake' } },
      },
    );

    expect(cardService.update).toBeCalledTimes(1);
    expect(result.card!.status.code).toStrictEqual(updatedCard.status.code);
  });
});
