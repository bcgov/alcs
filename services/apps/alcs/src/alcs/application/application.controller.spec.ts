import { ConfigModule } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { generateCANCApplicationHtml } from '../../../../../templates/emails/cancelled';
import {
  initApplicationMockEntity,
  initMockAssigneeDto,
} from '../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { UserProfile } from '../../common/automapper/user.automapper.profile';
import { TrackingService } from '../../common/tracking/tracking.service';
import { ApplicationOwner } from '../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { StatusEmailService } from '../../providers/email/status-email.service';
import { User } from '../../user/user.entity';
import { CardStatusDto } from '../card/card-status/card-status.dto';
import { CardDto } from '../card/card.dto';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { LocalGovernment } from '../local-government/local-government.entity';
import { MessageService } from '../message/message.service';
import { SUBMISSION_STATUS } from './application-submission-status/submission-status.dto';
import { ApplicationTimeData } from './application-time-tracking.service';
import { ApplicationController } from './application.controller';
import { ApplicationDto, UpdateApplicationDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: DeepMocked<ApplicationService>;
  let notificationService: DeepMocked<MessageService>;
  let cardService: DeepMocked<CardService>;
  let statusEmailService: DeepMocked<StatusEmailService>;
  let mockTrackingService: DeepMocked<TrackingService>;

  const mockApplicationEntity = initApplicationMockEntity();

  const mockApplicationDto: ApplicationDto = {
    uuid: 'fake',
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
      isFirstNation: false,
    },
    activeDays: 2,
    pausedDays: 0,
    paused: false,
    decisionMeetings: [],
    dateSubmittedToAlc: Date.now(),
    card: {
      assignee: initMockAssigneeDto(),
      status: {} as CardStatusDto,
      type: 'fake',
      uuid: 'fake',
      highPriority: false,
      boardCode: 'boardCode',
    } as CardDto,
    source: 'ALCS',
  };

  beforeEach(async () => {
    applicationService = createMock();
    notificationService = createMock();
    cardService = createMock();
    statusEmailService = createMock();
    mockTrackingService = createMock();

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
          provide: MessageService,
          useValue: notificationService,
        },
        {
          provide: CardService,
          useValue: cardService,
        },
        {
          provide: StatusEmailService,
          useValue: statusEmailService,
        },
        {
          provide: TrackingService,
          useValue: mockTrackingService,
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
    notificationService.create.mockResolvedValue();
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
      dateSubmittedToAlc: mockApplicationDto.dateSubmittedToAlc!,
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
    expect(notificationService.create).not.toHaveBeenCalled();
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
    expect(notificationService.createForCard).not.toHaveBeenCalled();
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
    expect(notificationService.createForCard).toBeCalledTimes(0);
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
    cardService.getWithBoard.mockResolvedValue(mockApplicationEntity.card!);

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

  it('should call through for loading a card', async () => {
    applicationService.getByCard.mockResolvedValue({
      ...mockApplicationEntity,
    } as Application);

    await controller.getByCardUuid(mockApplicationEntity.card!.uuid);

    expect(applicationService.getByCard).toBeCalledTimes(1);
    expect(applicationService.mapToDtos).toBeCalledTimes(1);
  });

  it('should call through for searching applications', async () => {
    applicationService.searchApplicationsByFileNumber.mockResolvedValue([
      mockApplicationEntity,
    ]);

    const res = await controller.searchApplications('1231');

    expect(res.length).toEqual(1);
    expect(applicationService.searchApplicationsByFileNumber).toBeCalledTimes(
      1,
    );
    expect(applicationService.mapToDtos).toBeCalledTimes(1);
  });

  it('should call through for get', async () => {
    mockTrackingService.trackView.mockResolvedValue();
    applicationService.getOrFail.mockResolvedValue(mockApplicationEntity);
    await controller.get(mockApplicationEntity.uuid, {
      user: {
        entity: new User(),
      },
    });

    expect(applicationService.getOrFail).toBeCalledTimes(1);
    expect(applicationService.mapToDtos).toBeCalledTimes(1);
    expect(mockTrackingService.trackView).toHaveBeenCalledTimes(1);
  });

  it('should call through for cancel', async () => {
    const primaryContactOwnerUuid = 'primary-contact';
    const localGovernmentUuid = 'local-government';
    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    const mockOwner = new ApplicationOwner({ uuid: primaryContactOwnerUuid });
    const mockApplicationSubmission = new ApplicationSubmission({
      owners: [mockOwner],
      primaryContactOwnerUuid,
      localGovernmentUuid,
    });

    statusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockApplicationSubmission,
      primaryContact: mockOwner,
      submissionGovernment: mockGovernment,
    });
    statusEmailService.sendApplicationStatusEmail.mockResolvedValue();
    applicationService.cancel.mockResolvedValue();

    await controller.cancel(mockApplicationEntity.uuid);

    expect(applicationService.cancel).toBeCalledTimes(1);
    expect(statusEmailService.sendApplicationStatusEmail).toBeCalledTimes(1);
    expect(statusEmailService.sendApplicationStatusEmail).toBeCalledWith({
      generateStatusHtml: generateCANCApplicationHtml,
      status: SUBMISSION_STATUS.CANCELLED,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
      parentType: 'application',
      primaryContact: mockOwner,
      ccGovernment: true,
    });
  });

  it('should call through for uncancel', async () => {
    applicationService.uncancel.mockResolvedValue();
    await controller.uncancel(mockApplicationEntity.uuid);

    expect(applicationService.uncancel).toBeCalledTimes(1);
  });
});
