import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentTimelineController } from './notice-of-intent-timeline.controller';
import { NoticeOfIntentTimelineService } from './notice-of-intent-timeline.service';

describe('NoticeOfIntentTimelineController', () => {
  let controller: NoticeOfIntentTimelineController;
  let mockTimelineService: DeepMocked<NoticeOfIntentTimelineService>;

  beforeEach(async () => {
    mockTimelineService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NoticeOfIntentTimelineService,
          useValue: mockTimelineService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [NoticeOfIntentTimelineController],
    }).compile();

    controller = module.get<NoticeOfIntentTimelineController>(
      NoticeOfIntentTimelineController,
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
