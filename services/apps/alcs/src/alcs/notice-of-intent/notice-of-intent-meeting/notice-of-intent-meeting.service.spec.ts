import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../libs/common/src/exceptions/base.exception';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent.service';
import { NoticeOfIntentMeetingType } from './notice-of-intent-meeting-type.entity';
import {
  CreateNoticeOfIntentMeetingServiceDto,
  UpdateNoticeOfIntentMeetingDto,
} from './notice-of-intent-meeting.dto';
import { NoticeOfIntentMeeting } from './notice-of-intent-meeting.entity';
import { NoticeOfIntentMeetingService } from './notice-of-intent-meeting.service';

describe('NoticeOfIntentMeetingService', () => {
  let service: NoticeOfIntentMeetingService;

  let mockNoiMeetingRepository: DeepMocked<Repository<NoticeOfIntentMeeting>>;
  let mockNoiMeetingTypeRepository: DeepMocked<
    Repository<NoticeOfIntentMeetingType>
  >;
  let mockNoiService: DeepMocked<NoticeOfIntentService>;

  let mockNoi;
  let mockMeeting: DeepMocked<NoticeOfIntentMeeting>;

  beforeEach(async () => {
    mockNoiService = createMock<NoticeOfIntentService>();
    mockNoiMeetingRepository = createMock<Repository<NoticeOfIntentMeeting>>();
    mockNoiMeetingTypeRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentMeetingService,
        {
          provide: getRepositoryToken(NoticeOfIntentMeeting),
          useValue: mockNoiMeetingRepository,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoiService,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentMeetingType),
          useValue: mockNoiMeetingTypeRepository,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentMeetingService>(
      NoticeOfIntentMeetingService,
    );

    mockNoi = createMock<NoticeOfIntent>();
    mockMeeting = createMock<NoticeOfIntentMeeting>();

    mockNoiMeetingRepository.find.mockResolvedValue([mockMeeting]);
    mockNoiMeetingRepository.findOne.mockResolvedValue(mockMeeting);
    mockNoiMeetingRepository.save.mockResolvedValue(mockMeeting);
    mockNoiService.getOrFail.mockResolvedValue(mockNoi);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get meetings for noi', async () => {
    const result = await service.getByAppFileNumber(mockNoi.fileNumber);

    expect(result).toStrictEqual([mockMeeting]);
  });

  it('should return empty array if no meetings for noi', async () => {
    mockNoiMeetingRepository.find.mockResolvedValue([]);
    const result = await service.getByAppFileNumber('non-existing number');

    expect(result).toStrictEqual([]);
  });

  it('should return meeting by uuid', async () => {
    const result = await service.get(mockMeeting.uuid);

    expect(result).toStrictEqual(mockMeeting);
  });

  it('should delete meeting with uuid', async () => {
    mockNoiMeetingRepository.softRemove.mockResolvedValue({} as any);
    await service.remove(mockMeeting);

    expect(mockNoiMeetingRepository.softRemove).toBeCalledTimes(1);
  });

  it('should create meeting', async () => {
    await service.create({} as CreateNoticeOfIntentMeetingServiceDto);

    expect(mockNoiMeetingRepository.findOne).toBeCalledTimes(1);
    expect(mockNoiMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should update meeting', async () => {
    const meetingToUpdate = {
      uuid: mockMeeting.uuid,
    } as NoticeOfIntentMeeting;

    await service.update(mockMeeting.uuid, {
      meetingStartDate: Date.now(),
      meetingEndDate: Date.now(),
      description: '',
    });

    expect(mockNoiMeetingRepository.findOne).toBeCalledTimes(2);
    expect(mockNoiMeetingRepository.findOne).toBeCalledWith({
      where: { uuid: meetingToUpdate.uuid },
      relations: {
        type: true,
      },
    });
    expect(mockNoiMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should allow setting end date to null', async () => {
    const meetingToUpdate = {
      uuid: mockMeeting.uuid,
    } as NoticeOfIntentMeeting;

    await service.update(mockMeeting.uuid, {
      meetingStartDate: Date.now(),
      meetingEndDate: null,
      description: '',
    });

    expect(mockNoiMeetingRepository.findOne).toBeCalledTimes(2);
    expect(mockNoiMeetingRepository.findOne).toBeCalledWith({
      where: { uuid: meetingToUpdate.uuid },
      relations: {
        type: true,
      },
    });
    expect(mockNoiMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should fail on update if meeting not found', async () => {
    mockNoiMeetingRepository.findOne.mockResolvedValue(null);

    expect(mockNoiMeetingRepository.save).toBeCalledTimes(0);
    await expect(
      service.update('fake-uuid', {} as UpdateNoticeOfIntentMeetingDto),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Meeting not found fake-uuid`),
    );
  });

  it('should fail on update if meeting start date > end date', async () => {
    expect(mockNoiMeetingRepository.save).toBeCalledTimes(0);
    await expect(
      service.update('fake-uuid', {
        meetingStartDate: 5,
        meetingEndDate: 1,
        description: '',
      }),
    ).rejects.toMatchObject(
      new ServiceValidationException(
        'Start Date must be smaller than End Date',
      ),
    );
  });
});
