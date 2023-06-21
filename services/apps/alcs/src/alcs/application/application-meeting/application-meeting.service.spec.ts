import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  initApplicationMeetingMock,
  initApplicationMockEntity,
} from '../../../../test/mocks/mockEntities';
import { ApplicationPaused } from '../application-paused.entity';
import { ApplicationService } from '../application.service';
import { UpdateApplicationMeetingDto } from './application-meeting.dto';
import { ApplicationMeeting } from './application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting.service';

describe('ApplicationMeetingService', () => {
  let service: ApplicationMeetingService;

  let mockAppMeetingRepository: DeepMocked<Repository<ApplicationMeeting>>;
  let mockPauseRepository: DeepMocked<Repository<ApplicationPaused>>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  let mockApplication;
  let mockMeeting;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockAppMeetingRepository = createMock();
    mockPauseRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationMeetingService,
        {
          provide: getRepositoryToken(ApplicationMeeting),
          useValue: mockAppMeetingRepository,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: getRepositoryToken(ApplicationPaused),
          useValue: mockPauseRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationMeetingService>(ApplicationMeetingService);

    mockApplication = initApplicationMockEntity();
    mockMeeting = initApplicationMeetingMock(mockApplication);

    mockAppMeetingRepository.find.mockResolvedValue([mockMeeting]);
    mockAppMeetingRepository.findOne.mockResolvedValue(mockMeeting);
    mockAppMeetingRepository.save.mockResolvedValue(mockMeeting);
    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get meetings for application', async () => {
    const result = await service.getByAppFileNumber(mockApplication.fileNumber);

    expect(result).toStrictEqual([mockMeeting]);
  });

  it('should return empty array if no meetings for application', async () => {
    mockAppMeetingRepository.find.mockResolvedValue([]);
    const result = await service.getByAppFileNumber('non-existing number');

    expect(result).toStrictEqual([]);
  });

  it('should return meeting by uuid', async () => {
    const result = await service.get(mockMeeting.uuid);

    expect(result).toStrictEqual(mockMeeting);
  });

  it('should delete meeting with uuid', async () => {
    mockAppMeetingRepository.softRemove.mockResolvedValue({} as any);
    await service.remove(mockMeeting);

    expect(mockAppMeetingRepository.softRemove).toBeCalledTimes(1);
  });

  it('should create meeting', async () => {
    await service.create({} as ApplicationMeeting);

    expect(mockAppMeetingRepository.findOne).toBeCalledTimes(1);
    expect(mockAppMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should update meeting', async () => {
    const meetingToUpdate = {
      uuid: mockMeeting.uuid,
    } as ApplicationMeeting;

    await service.update(mockMeeting.uuid, {
      meetingStartDate: Date.now(),
      meetingEndDate: Date.now(),
      description: '',
    });

    expect(mockAppMeetingRepository.findOne).toBeCalledTimes(2);
    expect(mockAppMeetingRepository.findOne).toBeCalledWith({
      where: { uuid: meetingToUpdate.uuid },
      relations: {
        type: true,
        meetingPause: true,
        reportPause: true,
      },
    });
    expect(mockAppMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should allow setting end date to null', async () => {
    const meetingToUpdate = {
      uuid: mockMeeting.uuid,
    } as ApplicationMeeting;

    await service.update(mockMeeting.uuid, {
      meetingStartDate: Date.now(),
      meetingEndDate: null,
      description: '',
    });

    expect(mockAppMeetingRepository.findOne).toBeCalledTimes(2);
    expect(mockAppMeetingRepository.findOne).toBeCalledWith({
      where: { uuid: meetingToUpdate.uuid },
      relations: {
        type: true,
        meetingPause: true,
        reportPause: true,
      },
    });
    expect(mockAppMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should fail on update if meeting not found', async () => {
    mockAppMeetingRepository.findOne.mockResolvedValue(null);

    expect(mockAppMeetingRepository.save).toBeCalledTimes(0);
    await expect(
      service.update('fake-uuid', {} as UpdateApplicationMeetingDto),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Meeting not found fake-uuid`),
    );
  });

  it('should fail on update if meeting start date > end date', async () => {
    expect(mockAppMeetingRepository.save).toBeCalledTimes(0);
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

  it('should delete the meeting pause if one exists and there is no start and end date', async () => {
    mockAppMeetingRepository.findOne.mockResolvedValue(
      new ApplicationMeeting({
        ...mockMeeting,
        reportPause: new ApplicationPaused(),
      }),
    );
    mockPauseRepository.delete.mockResolvedValue({} as any);

    await service.update('fake-uuid', {
      meetingStartDate: 1,
      meetingEndDate: 2,
      description: '',
      reportEndDate: null,
      reportStartDate: null,
    });

    expect(mockPauseRepository.delete).toHaveBeenCalledTimes(1);
  });
});
