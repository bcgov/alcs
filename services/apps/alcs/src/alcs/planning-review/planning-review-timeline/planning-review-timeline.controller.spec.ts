import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { PlanningReviewTimelineController } from './planning-review-timeline.controller';
import { PlanningReviewTimelineService } from './planning-review-timeline.service';

describe('PlanningReviewTimelineController', () => {
  let controller: PlanningReviewTimelineController;
  let mockTimelineService: DeepMocked<PlanningReviewTimelineService>;

  beforeEach(async () => {
    mockTimelineService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PlanningReviewTimelineService,
          useValue: mockTimelineService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [PlanningReviewTimelineController],
    }).compile();

    controller = module.get<PlanningReviewTimelineController>(
      PlanningReviewTimelineController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to get timeline events', async () => {
    mockTimelineService.getTimelineEvents.mockResolvedValue([]);
    const res = await controller.fetchTimelineEvents('fileNumber');

    expect(res).toBeDefined();
    expect(mockTimelineService.getTimelineEvents).toHaveBeenCalledTimes(1);
    expect(mockTimelineService.getTimelineEvents).toHaveBeenCalledWith(
      'fileNumber',
    );
  });
});
