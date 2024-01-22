import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationTimelineController } from './application-timeline.controller';
import { ApplicationTimelineService } from './application-timeline.service';

describe('ApplicationTimelineController', () => {
  let controller: ApplicationTimelineController;
  let mockTimelineService: DeepMocked<ApplicationTimelineService>;

  beforeEach(async () => {
    mockTimelineService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ApplicationTimelineService,
          useValue: mockTimelineService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [ApplicationTimelineController],
    }).compile();

    controller = module.get<ApplicationTimelineController>(
      ApplicationTimelineController,
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
