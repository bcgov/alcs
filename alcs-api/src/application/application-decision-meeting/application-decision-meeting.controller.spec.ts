import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Board } from '../../board/board.entity';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { UserProfile } from '../../common/automapper/user.automapper.profile';
import {
  initApplicationDecisionMeetingMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationCodeService } from '../application-code/application-code.service';
import { ApplicationDocumentService } from '../application-document/application-document.service';
import { ApplicationService } from '../application.service';
import { ApplicationDecisionMeetingController } from './application-decision-meeting.controller';
import {
  ApplicationDecisionMeetingDto,
  CreateApplicationDecisionMeetingDto,
} from './application-decision-meeting.dto';
import { ApplicationDecisionMeetingService } from './application-decision-meeting.service';

describe('ApplicationDecisionMeetingController', () => {
  let controller: ApplicationDecisionMeetingController;
  let mockMeetingService: DeepMocked<ApplicationDecisionMeetingService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationCodeService: DeepMocked<ApplicationCodeService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockMeetingService = createMock<ApplicationDecisionMeetingService>();
    mockApplicationService = createMock<ApplicationService>();
    mockApplicationCodeService = createMock<ApplicationCodeService>();
    mockAppDocumentService = createMock<ApplicationDocumentService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionMeetingController, ApplicationProfile],
      providers: [
        ApplicationProfile,
        UserProfile,
        {
          provide: ApplicationDecisionMeetingService,
          useValue: mockMeetingService,
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
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationDecisionMeetingController>(
      ApplicationDecisionMeetingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for application', async () => {
    const mockApplication = initApplicationMockEntity();
    const mockMeeting = initApplicationDecisionMeetingMock(mockApplication);
    mockMeetingService.getByAppFileNumber.mockResolvedValue([mockMeeting]);
    const result = await controller.getAllForApplication('fake-number');

    expect(mockMeetingService.getByAppFileNumber).toBeCalledTimes(1);
    expect(result[0].uuid).toStrictEqual(mockMeeting.uuid);
  });

  it('should get a specific meeting', async () => {
    const mockApplication = initApplicationMockEntity();
    const mockMeeting = initApplicationDecisionMeetingMock(mockApplication);
    mockMeetingService.get.mockResolvedValue(mockMeeting);
    const result = await controller.get('fake-uuid');

    expect(mockMeetingService.get).toBeCalledTimes(1);
    expect(result.uuid).toStrictEqual(mockMeeting.uuid);
  });

  it('should delete meeting', async () => {
    mockMeetingService.delete.mockReturnValue({} as any);

    await controller.delete('fake-uuid');

    expect(mockMeetingService.delete).toBeCalledTimes(1);
    expect(mockMeetingService.delete).toBeCalledWith('fake-uuid');
  });

  it('should create meeting if application exists', async () => {
    const appMock = initApplicationMockEntity();
    const mockMeeting = initApplicationDecisionMeetingMock(appMock);
    mockApplicationService.get.mockResolvedValue(appMock);
    mockMeetingService.createOrUpdate.mockResolvedValue(mockMeeting);

    const meetingToUpdate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: appMock.fileNumber,
    } as CreateApplicationDecisionMeetingDto;

    await controller.create(meetingToUpdate);

    expect(mockMeetingService.createOrUpdate).toBeCalledTimes(1);
    expect(mockMeetingService.createOrUpdate).toBeCalledWith({
      date: new Date(meetingToUpdate.date),
      applicationUuid: appMock.uuid,
    });
  });

  it('should fail create meeting if application does not exist', async () => {
    mockApplicationService.get.mockReturnValue(undefined);

    await expect(
      controller.create({
        applicationFileNumber: 'fake-number',
      } as CreateApplicationDecisionMeetingDto),
    ).rejects.toMatchObject(
      new NotFoundException('Application not found fake-number'),
    );

    expect(mockMeetingService.createOrUpdate).toBeCalledTimes(0);
  });

  it('should update meeting', async () => {
    const appMock = initApplicationMockEntity();
    const mockMeeting = initApplicationDecisionMeetingMock(appMock);
    mockMeetingService.createOrUpdate.mockResolvedValue(mockMeeting);
    const meetingToUpdate = {
      uuid: mockMeeting.uuid,
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
    } as ApplicationDecisionMeetingDto;

    await controller.update(meetingToUpdate);

    expect(mockMeetingService.createOrUpdate).toBeCalledTimes(1);
    expect(mockMeetingService.createOrUpdate).toBeCalledWith({
      uuid: meetingToUpdate.uuid,
      date: new Date(meetingToUpdate.date),
    });
  });

  it('should load and map meetings', async () => {
    const appMock = initApplicationMockEntity();
    appMock.board = {
      code: 'CODE',
    } as Board;
    const mockMeeting = initApplicationDecisionMeetingMock(appMock);
    mockApplicationService.getAll.mockResolvedValue([appMock]);
    mockMeetingService.getUpcomingMeetings.mockResolvedValue([
      {
        uuid: appMock.uuid,
        next_meeting: mockMeeting.date.toISOString(),
      },
    ]);
    mockAppDocumentService.listAll.mockResolvedValue([]);

    const res = await controller.getMeetings();

    expect(res.CODE).toBeDefined();
    expect(res.CODE.length).toEqual(1);
    expect(res.CODE[0].meetingDate).toEqual(mockMeeting.date.getTime());
    expect(res.CODE[0].fileNumber).toEqual(appMock.fileNumber);
  });
});
