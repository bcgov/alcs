import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import {
  initApplicationMeetingMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../../common/utils/test-helpers/mockTypes';
import { ApplicationService } from '../application.service';
import { UpdateApplicationMeetingDto } from './application-meeting.dto';
import { ApplicationMeeting } from './application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting.service';

describe('ApplicationMeetingService', () => {
  let service: ApplicationMeetingService;

  let mockAppMeetingRepository: MockType<Repository<ApplicationMeeting>>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  let mockApplication;
  let mockMeeting;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationMeetingService,
        {
          provide: getRepositoryToken(ApplicationMeeting),
          useFactory: repositoryMockFactory,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    }).compile();

    service = module.get<ApplicationMeetingService>(ApplicationMeetingService);

    mockApplication = initApplicationMockEntity();
    mockMeeting = initApplicationMeetingMock(mockApplication);

    mockAppMeetingRepository = module.get(
      getRepositoryToken(ApplicationMeeting),
    );
    mockAppMeetingRepository = module.get(
      getRepositoryToken(ApplicationMeeting),
    );
    mockAppMeetingRepository.find.mockReturnValue([mockMeeting]);
    mockAppMeetingRepository.findOne.mockReturnValue(mockMeeting);
    mockApplicationService.get.mockResolvedValue(mockApplication);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get meetings for application', async () => {
    const result = await service.getByAppFileNumber(mockApplication.fileNumber);

    expect(result).toStrictEqual([mockMeeting]);
  });

  it('should fail on get meetings if application does not exist', async () => {
    mockApplicationService.get.mockResolvedValue(null);

    await expect(
      service.getByAppFileNumber('fake-file-number'),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        'Application with provided number not found fake-file-number',
      ),
    );
  });

  it('should return empty array if no meetings for application', async () => {
    mockAppMeetingRepository.find.mockReturnValue([]);
    const result = await service.getByAppFileNumber('non-existing number');

    expect(result).toStrictEqual([]);
  });

  it('should return meeting by uuid', async () => {
    const result = await service.get(mockMeeting.uuid);

    expect(result).toStrictEqual(mockMeeting);
  });

  it('should delete meeting with uuid', async () => {
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
        applicationPaused: true,
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
        applicationPaused: true,
      },
    });
    expect(mockAppMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should fail on update if meeting not found', async () => {
    mockAppMeetingRepository.findOne.mockReturnValue(undefined);

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
});
