import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { PlanningReviewProfile } from '../../../common/automapper/planning-review.automapper.profile';
import { PlanningReviewMeetingType } from './planning-review-meeting-type.entity';
import { PlanningReviewMeetingController } from './planning-review-meeting.controller';
import {
  CreatePlanningReviewMeetingDto,
  UpdatePlanningReviewMeetingDto,
} from './planning-review-meeting.dto';
import { PlanningReviewMeeting } from './planning-review-meeting.entity';
import { PlanningReviewMeetingService } from './planning-review-meeting.service';

describe('PlanningReviewMeetingController', () => {
  let controller: PlanningReviewMeetingController;
  let mockPlanningReviewMeetingService: DeepMocked<PlanningReviewMeetingService>;

  beforeEach(async () => {
    mockPlanningReviewMeetingService = createMock();

    const module = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [PlanningReviewMeetingController],
      providers: [
        PlanningReviewProfile,
        {
          provide: PlanningReviewMeetingService,
          useValue: mockPlanningReviewMeetingService,
        },
      ],
    }).compile();

    controller = module.get(PlanningReviewMeetingController);
  });

  it('should call through to service for getByPlanningReview', async () => {
    mockPlanningReviewMeetingService.getByPlanningReview.mockResolvedValue([]);

    await controller.findAllByPlanningReview('uuid');

    expect(
      mockPlanningReviewMeetingService.getByPlanningReview,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockPlanningReviewMeetingService.getByPlanningReview,
    ).toHaveBeenCalledWith('uuid');
  });

  it('should call through to service for findOne', async () => {
    mockPlanningReviewMeetingService.getByUuid.mockResolvedValue(
      new PlanningReviewMeeting({
        date: new Date(),
      }),
    );

    await controller.findOne('uuid');

    expect(mockPlanningReviewMeetingService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewMeetingService.getByUuid).toHaveBeenCalledWith(
      'uuid',
    );
  });

  it('should call through to service for listTypes', async () => {
    mockPlanningReviewMeetingService.listTypes.mockResolvedValue([
      new PlanningReviewMeetingType(),
    ]);

    const res = await controller.listTypes();

    expect(mockPlanningReviewMeetingService.listTypes).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
  });

  it('should call through to service for create', async () => {
    mockPlanningReviewMeetingService.create.mockResolvedValue(
      new PlanningReviewMeeting({
        date: new Date(),
      }),
    );
    const createDto: CreatePlanningReviewMeetingDto = {
      date: 0,
      planningReviewUuid: '',
      typeCode: '',
    };

    await controller.create(createDto);

    expect(mockPlanningReviewMeetingService.create).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewMeetingService.create).toHaveBeenCalledWith(
      createDto,
    );
  });

  it('should call through to service for update', async () => {
    mockPlanningReviewMeetingService.update.mockResolvedValue();
    const updateDto: UpdatePlanningReviewMeetingDto = {
      date: 5,
      typeCode: 'new-type',
    };

    await controller.update('uuid', updateDto);

    expect(mockPlanningReviewMeetingService.update).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewMeetingService.update).toHaveBeenCalledWith(
      'uuid',
      updateDto,
    );
  });

  it('should call through to service for remove', async () => {
    mockPlanningReviewMeetingService.remove.mockResolvedValue();

    await controller.remove('uuid');

    expect(mockPlanningReviewMeetingService.remove).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewMeetingService.remove).toHaveBeenCalledWith(
      'uuid',
    );
  });
});
