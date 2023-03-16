import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  initApplicationDecisionMeetingMock,
  initApplicationMockEntity,
} from '../../../../test/mocks/mockEntities';
import { ApplicationService } from '../../application/application.service';
import { ApplicationDecisionMeeting } from './application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from './application-decision-meeting.service';

describe('ApplicationDecisionMeetingService', () => {
  let service: ApplicationDecisionMeetingService;
  let mockAppDecisionMeetingRepository: DeepMocked<
    Repository<ApplicationDecisionMeeting>
  >;
  let mockApplicationService: DeepMocked<ApplicationService>;

  let mockApplication;
  let mockMeeting;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();
    mockAppDecisionMeetingRepository =
      createMock<Repository<ApplicationDecisionMeeting>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDecisionMeetingService,
        {
          provide: getRepositoryToken(ApplicationDecisionMeeting),
          useValue: mockAppDecisionMeetingRepository,
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
    mockAppDecisionMeetingRepository.find.mockResolvedValue([mockMeeting]);
    mockAppDecisionMeetingRepository.findOneOrFail.mockResolvedValue(
      mockMeeting,
    );
    mockAppDecisionMeetingRepository.findOne.mockResolvedValue(mockMeeting);
    mockAppDecisionMeetingRepository.findOneOrFail.mockResolvedValue(
      mockMeeting,
    );
    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get decision meetings for application', async () => {
    const result = await service.getByAppFileNumber(mockApplication.fileNumber);

    expect(result).toStrictEqual([mockMeeting]);
  });

  it('should return empty array if no meetings for application', async () => {
    mockAppDecisionMeetingRepository.find.mockResolvedValue([]);
    const result = await service.getByAppFileNumber('non-existing number');

    expect(result).toStrictEqual([]);
  });

  it('should return decision meeting by uuid', async () => {
    const result = await service.get(mockMeeting.uuid);

    expect(result).toStrictEqual(mockMeeting);
  });

  it('should delete meeting with uuid', async () => {
    mockAppDecisionMeetingRepository.softRemove.mockResolvedValue({} as any);

    await service.delete(mockMeeting.uuid);

    expect(mockAppDecisionMeetingRepository.softRemove).toBeCalledTimes(1);
  });

  it('should create meeting', async () => {
    mockAppDecisionMeetingRepository.save.mockResolvedValue({} as any);

    const meetingToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2),
    } as ApplicationDecisionMeeting;

    await service.createOrUpdate(meetingToCreate);

    expect(mockAppDecisionMeetingRepository.findOne).toBeCalledTimes(0);
    expect(mockAppDecisionMeetingRepository.save).toBeCalledTimes(1);
  });

  it('should update meeting', async () => {
    mockAppDecisionMeetingRepository.save.mockResolvedValue({} as any);

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
    mockAppDecisionMeetingRepository.findOne.mockResolvedValue(null);
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
