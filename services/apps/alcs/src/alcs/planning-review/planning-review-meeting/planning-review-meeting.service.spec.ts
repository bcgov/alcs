import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanningReview } from '../planning-review.entity';
import { PlanningReviewService } from '../planning-review.service';
import { PlanningReviewMeetingType } from './planning-review-meeting-type.entity';
import { UpdatePlanningReviewMeetingDto } from './planning-review-meeting.dto';
import { PlanningReviewMeeting } from './planning-review-meeting.entity';
import { PlanningReviewMeetingService } from './planning-review-meeting.service';

describe('PlanningReviewMeetingService', () => {
  let service: PlanningReviewMeetingService;
  let mockPlanningReviewMeetingRepository: DeepMocked<
    Repository<PlanningReviewMeeting>
  >;
  let mockPlanningReviewMeetingTypeRepository: DeepMocked<
    Repository<PlanningReviewMeetingType>
  >;
  let mockPlanningReviewService: DeepMocked<PlanningReviewService>;

  beforeEach(async () => {
    mockPlanningReviewMeetingRepository = createMock();
    mockPlanningReviewMeetingTypeRepository = createMock();
    mockPlanningReviewService = createMock();

    const module = await Test.createTestingModule({
      providers: [
        PlanningReviewMeetingService,
        {
          provide: getRepositoryToken(PlanningReviewMeeting),
          useValue: mockPlanningReviewMeetingRepository,
        },
        {
          provide: getRepositoryToken(PlanningReviewMeetingType),
          useValue: mockPlanningReviewMeetingTypeRepository,
        },
        {
          provide: PlanningReviewService,
          useValue: mockPlanningReviewService,
        },
      ],
    }).compile();

    service = module.get(PlanningReviewMeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call find on the type repo for list types', async () => {
    mockPlanningReviewMeetingTypeRepository.find.mockResolvedValue([
      new PlanningReviewMeetingType(),
    ]);

    const res = await service.listTypes();

    expect(res.length).toEqual(1);
    expect(mockPlanningReviewMeetingTypeRepository.find).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call find on the repo for get by planning review', async () => {
    mockPlanningReviewMeetingRepository.find.mockResolvedValue([
      new PlanningReviewMeeting(),
    ]);

    const res = await service.getByPlanningReview('uuid');

    expect(res.length).toEqual(1);
    expect(mockPlanningReviewMeetingRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should call findOne on the repo for get by uuid', async () => {
    mockPlanningReviewMeetingRepository.findOne.mockResolvedValue(
      new PlanningReviewMeeting(),
    );

    const res = await service.getByUuid('uuid');

    expect(res).toBeDefined();
    expect(mockPlanningReviewMeetingRepository.findOne).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should load the type and parent then save for create', async () => {
    mockPlanningReviewService.getOrFail.mockResolvedValue(new PlanningReview());
    mockPlanningReviewMeetingTypeRepository.findOneOrFail.mockResolvedValue(
      new PlanningReviewMeetingType(),
    );

    mockPlanningReviewMeetingRepository.save.mockResolvedValue(
      new PlanningReviewMeeting(),
    );

    const res = await service.create({
      date: 0,
      planningReviewUuid: '',
      typeCode: '',
    });

    expect(res).toBeDefined();
    expect(mockPlanningReviewService.getOrFail).toHaveBeenCalledTimes(1);
    expect(
      mockPlanningReviewMeetingTypeRepository.findOneOrFail,
    ).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewMeetingRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should load the type then save for update', async () => {
    const mockResult = new PlanningReviewMeeting();
    const mockUpdate: UpdatePlanningReviewMeetingDto = {
      date: 15,
      typeCode: 'NEW_TYPE',
    };
    const mockType = new PlanningReviewMeetingType({
      code: 'NEW_TYPE',
    });

    mockPlanningReviewMeetingTypeRepository.findOneOrFail.mockResolvedValue(
      mockType,
    );

    mockPlanningReviewMeetingRepository.findOneOrFail.mockResolvedValue(
      mockResult,
    );
    mockPlanningReviewMeetingRepository.save.mockResolvedValue(mockResult);

    await service.update('uuid', mockUpdate);

    expect(
      mockPlanningReviewMeetingTypeRepository.findOneOrFail,
    ).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewMeetingRepository.save).toHaveBeenCalledTimes(1);
    expect(mockResult.date).toEqual(new Date(mockUpdate.date));
    expect(mockResult.type).toEqual(mockType);
  });
});
