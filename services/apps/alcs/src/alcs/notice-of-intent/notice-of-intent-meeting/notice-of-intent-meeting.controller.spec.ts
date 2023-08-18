import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentProfile } from '../../../common/automapper/notice-of-intent.automapper.profile';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent.service';
import { NoticeOfIntentMeetingType } from './notice-of-intent-meeting-type.entity';
import { NoticeOfIntentMeetingController } from './notice-of-intent-meeting.controller';
import {
  CreateNoticeOfIntentMeetingDto,
  UpdateNoticeOfIntentMeetingDto,
} from './notice-of-intent-meeting.dto';
import { NoticeOfIntentMeeting } from './notice-of-intent-meeting.entity';
import { NoticeOfIntentMeetingService } from './notice-of-intent-meeting.service';

describe('NoticeOfIntentMeetingController', () => {
  let controller: NoticeOfIntentMeetingController;
  let mockNoticeOfIntentMeetingService: DeepMocked<NoticeOfIntentMeetingService>;
  let mockNoticeOfIntentService: DeepMocked<NoticeOfIntentService>;

  let mockNoi;
  let mockMeeting;

  beforeEach(async () => {
    mockNoticeOfIntentMeetingService = createMock();
    mockNoticeOfIntentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentMeetingController],
      providers: [
        NoticeOfIntentProfile,
        {
          provide: NoticeOfIntentMeetingService,
          useValue: mockNoticeOfIntentMeetingService,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoticeOfIntentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentMeetingController>(
      NoticeOfIntentMeetingController,
    );

    mockNoticeOfIntentMeetingService.fetNoticeOfIntentMeetingTypes.mockResolvedValue(
      [
        {
          code: 'fake',
        } as NoticeOfIntentMeetingType,
      ],
    );

    mockNoi = createMock<DeepMocked<NoticeOfIntent>>();
    mockNoi.uuid = 'fakeUuid';

    mockMeeting = createMock<DeepMocked<NoticeOfIntentMeeting>>();
    mockMeeting.startDate = new Date(1, 1, 1);
    mockMeeting.endDate = new Date(1, 1, 1);
    mockMeeting.noticeOfIntent = new NoticeOfIntent({ uuid: mockNoi.uuid });
    mockMeeting.typeCode = 'fake';
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for notice of intent', async () => {
    mockNoticeOfIntentMeetingService.getByAppFileNumber.mockResolvedValue([
      mockMeeting,
    ]);
    const result = await controller.getAllForApplication('fake-number');

    expect(mockNoticeOfIntentMeetingService.getByAppFileNumber).toBeCalledTimes(
      1,
    );
    expect(result[0].uuid).toStrictEqual(mockMeeting.uuid);
  });

  it('should delete meeting', async () => {
    mockNoticeOfIntentMeetingService.get.mockResolvedValue(mockMeeting);
    mockNoticeOfIntentMeetingService.remove.mockResolvedValue({} as any);

    await controller.delete('fake-uuid');

    expect(mockNoticeOfIntentMeetingService.remove).toBeCalledTimes(1);
    expect(mockNoticeOfIntentMeetingService.remove).toBeCalledWith(mockMeeting);
  });

  it('should create meeting if notice of intent exists', async () => {
    mockNoticeOfIntentService.getOrFailByUuid.mockResolvedValue(mockNoi);
    mockNoticeOfIntentMeetingService.create.mockResolvedValue(mockMeeting);

    const meetingToUpdate: CreateNoticeOfIntentMeetingDto = {
      meetingStartDate: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      meetingTypeCode: 'fake',
      description: 'EMPTY',
    };

    await controller.create(meetingToUpdate, 'file-number');

    expect(mockNoticeOfIntentMeetingService.create).toBeCalledTimes(1);
    const calledData = mockNoticeOfIntentMeetingService.create.mock.calls[0][0];
    expect(calledData.noticeOfIntentUuid).toEqual(
      mockMeeting.noticeOfIntent.uuid,
    );
    expect(calledData.meetingTypeCode).toBe(mockMeeting.typeCode);
  });

  it('should update meeting', async () => {
    mockNoticeOfIntentMeetingService.update.mockResolvedValue(mockMeeting);
    const meetingToUpdate = {
      meetingStartDate: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      meetingEndDate: new Date(2022, 3, 2, 2, 2, 2, 2).valueOf(),
    } as UpdateNoticeOfIntentMeetingDto;

    await controller.update(meetingToUpdate, mockMeeting.uuid);

    expect(mockNoticeOfIntentMeetingService.update).toBeCalledTimes(1);
    expect(mockNoticeOfIntentMeetingService.update).toBeCalledWith(
      mockMeeting.uuid,
      {
        meetingStartDate: meetingToUpdate.meetingStartDate,
        meetingEndDate: meetingToUpdate.meetingEndDate,
      },
    );
  });
});
