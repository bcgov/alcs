import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import {
  initApplicationDecisionMeetingMock,
  initApplicationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../../common/utils/test-helpers/mockTypes';
import { ApplicationService } from '../application.service';
import { ApplicationDecisionMeeting } from './application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from './application-decision-meeting.service';

describe('ApplicationDecisionMeetingService', () => {
  let service: ApplicationDecisionMeetingService;
  let mockAppDecisionMeetingRepository: MockType<
    Repository<ApplicationDecisionMeeting>
  >;
  let mockApplicationService;

  let mockApplication;
  let mockMeeting;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDecisionMeetingService,
        {
          provide: getRepositoryToken(ApplicationDecisionMeeting),
          useFactory: repositoryMockFactory,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionMeetingService>(
      ApplicationDecisionMeetingService,
    );

    mockApplication = initApplicationMockEntity();
    mockMeeting = initApplicationDecisionMeetingMock(mockApplication);

    mockAppDecisionMeetingRepository = module.get(
      getRepositoryToken(ApplicationDecisionMeeting),
    );
    mockAppDecisionMeetingRepository.find.mockReturnValue([mockMeeting]);
    mockAppDecisionMeetingRepository.findOne.mockReturnValue(mockMeeting);
    mockApplicationService.get.mockResolvedValue(mockApplication);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get decision meetings for application', async () => {
    const result = await service.getByAppFileNumber(mockApplication.fileNumber);

    expect(result).toStrictEqual([mockMeeting]);
  });

  it('should fail on get decision meetings if application does not exist', async () => {
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
    mockAppDecisionMeetingRepository.find.mockReturnValue([]);
    const result = await service.getByAppFileNumber('non-existing number');

    expect(result).toStrictEqual([]);
  });

  it('should return decision meeting by uuid', async () => {
    const result = await service.get(mockMeeting.uuid);

    expect(result).toStrictEqual(mockMeeting);
  });

  it('should delete meeting with uuid', async () => {
    await service.delete(mockMeeting.uuid);

    expect(mockAppDecisionMeetingRepository.softRemove).toBeCalledTimes(1);
  });

  it('should create meeting', async () => {
    const meetingToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2),
    } as ApplicationDecisionMeeting;

    await service.createOrUpdate(meetingToCreate);

    expect(mockAppDecisionMeetingRepository.findOne).toBeCalledTimes(0);
    expect(mockAppDecisionMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should update meeting', async () => {
    const meetingToUpdate = {
      uuid: mockMeeting.uuid,
      date: new Date(2022, 2, 2, 2, 2, 2, 2),
    } as ApplicationDecisionMeeting;

    await service.createOrUpdate(meetingToUpdate);

    expect(mockAppDecisionMeetingRepository.findOne).toBeCalledTimes(1);
    expect(mockAppDecisionMeetingRepository.findOne).toBeCalledWith({
      where: { uuid: meetingToUpdate.uuid },
    });
    expect(mockAppDecisionMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should fail on update if meeting not found', async () => {
    mockAppDecisionMeetingRepository.findOne.mockReturnValue(undefined);
    const meetingToUpdate = {
      uuid: 'non-existing uuid',
    } as ApplicationDecisionMeeting;

    expect(mockAppDecisionMeetingRepository.save).toBeCalledTimes(0);
    await expect(service.createOrUpdate(meetingToUpdate)).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Decision meeting not found ${meetingToUpdate.uuid}`,
      ),
    );
  });
});
