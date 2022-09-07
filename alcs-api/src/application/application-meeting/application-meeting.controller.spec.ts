import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/nestjs-testing';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import {
  initApplicationMeetingMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationCodeService } from '../application-code/application-code.service';
import { ApplicationService } from '../application.service';
import { ApplicationMeetingController } from './application-meeting.controller';
import {
  ApplicationMeetingDto,
  CreateApplicationMeetingDto,
} from './application-meeting.dto';
import { ApplicationMeetingService } from './application-meeting.service';

describe('ApplicationMeetingController', () => {
  let controller: ApplicationMeetingController;
  let mockMeetingService;
  let mockApplicationService;
  let mockApplicationCodeService;

  beforeEach(async () => {
    mockMeetingService = createMock<ApplicationMeetingService>();
    mockApplicationService = createMock<ApplicationService>();
    mockApplicationCodeService = createMock<ApplicationCodeService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationMeetingController, ApplicationProfile],
      providers: [
        {
          provide: ApplicationMeetingService,
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
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationMeetingController>(
      ApplicationMeetingController,
    );

    mockApplicationCodeService.fetchMeetingType.mockReturnValue({
      uuid: 'fake',
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for application', async () => {
    const mockApplication = initApplicationMockEntity();
    const mockMeeting = initApplicationMeetingMock(mockApplication);
    mockMeetingService.getByAppFileNumber.mockReturnValue([mockMeeting]);
    const result = await controller.getAllForApplication('fake-number');

    expect(mockMeetingService.getByAppFileNumber).toBeCalledTimes(1);
    expect(result[0].uuid).toStrictEqual(mockMeeting.uuid);
  });

  it('should delete meeting', async () => {
    mockMeetingService.delete.mockReturnValue({});

    await controller.delete('fake-uuid');

    expect(mockMeetingService.delete).toBeCalledTimes(1);
    expect(mockMeetingService.delete).toBeCalledWith('fake-uuid');
  });

  it('should create meeting if application exists', async () => {
    const appMock = initApplicationMockEntity();
    const mockMeeting = initApplicationMeetingMock(appMock);
    mockApplicationService.get.mockReturnValue(appMock);
    mockMeetingService.createOrUpdate.mockReturnValue(mockMeeting);

    const meetingToUpdate = {
      startDate: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      endDate: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: appMock.fileNumber,
    } as CreateApplicationMeetingDto;

    await controller.create(meetingToUpdate);

    expect(mockMeetingService.createOrUpdate).toBeCalledTimes(1);
    expect(mockMeetingService.createOrUpdate).toBeCalledWith({
      startDate: new Date(meetingToUpdate.startDate),
      endDate: new Date(meetingToUpdate.endDate),
      applicationUuid: appMock.uuid,
      typeUuid: 'fake',
    });
  });

  it('should fail create meeting if application does not exist', async () => {
    mockApplicationService.get.mockReturnValue(undefined);

    await expect(
      controller.create({
        applicationFileNumber: 'fake-number',
      } as CreateApplicationMeetingDto),
    ).rejects.toMatchObject(
      new NotFoundException('Application not found fake-number'),
    );

    expect(mockMeetingService.createOrUpdate).toBeCalledTimes(0);
  });

  it('should update meeting', async () => {
    const appMock = initApplicationMockEntity();
    const mockMeeting = initApplicationMeetingMock(appMock);
    mockMeetingService.createOrUpdate.mockReturnValue(mockMeeting);
    const meetingToUpdate = {
      uuid: mockMeeting.uuid,
      startDate: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      endDate: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: appMock.fileNumber,
    } as ApplicationMeetingDto;

    await controller.update(meetingToUpdate);

    expect(mockMeetingService.createOrUpdate).toBeCalledTimes(1);
    expect(mockMeetingService.createOrUpdate).toBeCalledWith({
      startDate: new Date(meetingToUpdate.startDate),
      endDate: new Date(meetingToUpdate.endDate),
      uuid: mockMeeting.uuid,
    });
  });

  it('should fail create meeting if application type does not exist', async () => {
    const appMock = initApplicationMockEntity();
    initApplicationMeetingMock(appMock);
    mockApplicationService.get.mockReturnValue(appMock);
    mockApplicationCodeService.fetchMeetingType.mockReturnValue(undefined);

    await expect(
      controller.create({
        applicationFileNumber: 'fake-number',
        meetingTypeCode: 'fake-code',
      } as CreateApplicationMeetingDto),
    ).rejects.toMatchObject(
      new NotFoundException('Application Meeting Type not found fake-code'),
    );

    expect(mockMeetingService.createOrUpdate).toBeCalledTimes(0);
  });
});
