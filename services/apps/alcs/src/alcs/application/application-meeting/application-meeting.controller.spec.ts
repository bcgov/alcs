import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationRegion } from '../../code/application-code/application-region/application-region.entity';
import { CodeService } from '../../code/code.service';
import { ApplicationProfile } from '../../../common/automapper/application.automapper.profile';
import {
  initApplicationMeetingMock,
  initApplicationMockEntity,
} from '../../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationPaused } from '../application-paused.entity';
import { ApplicationPausedService } from '../application-paused/application-paused.service';
import { ApplicationService } from '../application.service';
import { ApplicationMeetingController } from './application-meeting.controller';
import {
  CreateApplicationMeetingDto,
  UpdateApplicationMeetingDto,
} from './application-meeting.dto';
import { ApplicationMeetingService } from './application-meeting.service';

describe('ApplicationMeetingController', () => {
  let controller: ApplicationMeetingController;
  let mockMeetingService: DeepMocked<ApplicationMeetingService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationCodeService: DeepMocked<CodeService>;
  let mockPausedService: DeepMocked<ApplicationPausedService>;

  beforeEach(async () => {
    mockMeetingService = createMock<ApplicationMeetingService>();
    mockApplicationService = createMock<ApplicationService>();
    mockApplicationCodeService = createMock<CodeService>();
    mockPausedService = createMock<ApplicationPausedService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationMeetingController],
      providers: [
        ApplicationProfile,
        {
          provide: ApplicationMeetingService,
          useValue: mockMeetingService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: CodeService,
          useValue: mockApplicationCodeService,
        },
        {
          provide: ApplicationPausedService,
          useValue: mockPausedService,
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

    mockApplicationCodeService.fetchMeetingType.mockResolvedValue({
      code: 'fake',
    } as ApplicationRegion);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for application', async () => {
    const mockApplication = initApplicationMockEntity();
    const mockMeeting = initApplicationMeetingMock(mockApplication);
    mockMeetingService.getByAppFileNumber.mockResolvedValue([mockMeeting]);
    const result = await controller.getAllForApplication('fake-number');

    expect(mockMeetingService.getByAppFileNumber).toBeCalledTimes(1);
    expect(result[0].uuid).toStrictEqual(mockMeeting.uuid);
  });

  it('should delete meeting', async () => {
    const mockApplication = initApplicationMockEntity();
    const mockMeeting = initApplicationMeetingMock(mockApplication);
    mockMeetingService.get.mockResolvedValue(mockMeeting);
    mockMeetingService.remove.mockResolvedValue({} as any);
    mockPausedService.remove.mockResolvedValue({} as any);

    await controller.delete('fake-uuid');

    expect(mockMeetingService.remove).toBeCalledTimes(1);
    expect(mockMeetingService.remove).toBeCalledWith(mockMeeting);
    expect(mockPausedService.remove).toHaveBeenCalledTimes(1);
  });

  it('should create meeting if application exists', async () => {
    const appMock = initApplicationMockEntity();
    const mockMeeting = initApplicationMeetingMock(appMock);
    const fakePause = {} as ApplicationPaused;
    mockApplicationService.getOrFail.mockResolvedValue(appMock);
    mockMeetingService.create.mockResolvedValue(mockMeeting);
    mockPausedService.createOrUpdate.mockResolvedValue(fakePause);

    const meetingToUpdate: CreateApplicationMeetingDto = {
      meetingStartDate: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      meetingTypeCode: 'CODE',
      description: 'EMPTY',
    };

    await controller.create(meetingToUpdate, 'file-number');

    expect(mockMeetingService.create).toBeCalledTimes(1);
    const calledData = mockMeetingService.create.mock.calls[0][0];
    expect(calledData.application).toEqual(appMock);
    expect(calledData.meetingPause).toBe(fakePause);
    expect(calledData.typeCode).toBe(mockMeeting.typeCode);
  });

  it('should update meeting', async () => {
    const appMock = initApplicationMockEntity();
    const mockMeeting = initApplicationMeetingMock(appMock);
    mockMeetingService.update.mockResolvedValue(mockMeeting);
    const meetingToUpdate = {
      meetingStartDate: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      meetingEndDate: new Date(2022, 3, 2, 2, 2, 2, 2).valueOf(),
      reportStartDate: new Date(2022, 4, 2, 2, 2, 2, 2).valueOf(),
      reportEndDate: new Date(2022, 5, 2, 2, 2, 2, 2).valueOf(),
    } as UpdateApplicationMeetingDto;

    await controller.update(meetingToUpdate, mockMeeting.uuid);

    expect(mockMeetingService.update).toBeCalledTimes(1);
    expect(mockMeetingService.update).toBeCalledWith(mockMeeting.uuid, {
      meetingStartDate: meetingToUpdate.meetingStartDate,
      meetingEndDate: meetingToUpdate.meetingEndDate,
      reportStartDate: meetingToUpdate.reportStartDate,
      reportEndDate: meetingToUpdate.reportEndDate,
    });
  });
});
