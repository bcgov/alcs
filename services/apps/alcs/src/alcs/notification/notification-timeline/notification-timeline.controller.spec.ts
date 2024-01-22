import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NotificationTimelineController } from './notification-timeline.controller';
import { NotificationTimelineService } from './notification-timeline.service';

describe('NoticeOfIntentTimelineController', () => {
  let controller: NotificationTimelineController;
  let mockTimelineService: DeepMocked<NotificationTimelineService>;

  beforeEach(async () => {
    mockTimelineService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NotificationTimelineService,
          useValue: mockTimelineService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [NotificationTimelineController],
    }).compile();

    controller = module.get<NotificationTimelineController>(
      NotificationTimelineController,
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
