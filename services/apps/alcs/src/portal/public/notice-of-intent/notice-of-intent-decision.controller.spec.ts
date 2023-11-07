import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentDecisionV2Service } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecision } from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentDecisionProfile } from '../../../common/automapper/notice-of-intent-decision.automapper.profile';
import { NoticeOfIntentSubmission } from '../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../../notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentDecisionController } from './notice-of-intent-decision.controller';

describe('NoticeOfIntentDecisionController', () => {
  let controller: NoticeOfIntentDecisionController;
  let mockNOISubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockDecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;

  beforeEach(async () => {
    mockNOISubmissionService = createMock();
    mockDecisionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentDecisionController],
      providers: [
        NoticeOfIntentDecisionProfile,
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNOISubmissionService,
        },
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<NoticeOfIntentDecisionController>(
      NoticeOfIntentDecisionController,
    );

    mockNOISubmissionService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for loading decisions', async () => {
    mockDecisionService.getForPortal.mockResolvedValue([
      new NoticeOfIntentDecision(),
    ]);

    const res = await controller.listDecisions('');

    expect(res.length).toEqual(1);
    expect(mockDecisionService.getForPortal).toHaveBeenCalledTimes(1);
  });

  it('should call through for loading files', async () => {
    mockDecisionService.getDownloadForPortal.mockResolvedValue('Mock Url');

    const res = await controller.openFile('');

    expect(res.url).toBeTruthy();
    expect(mockDecisionService.getDownloadForPortal).toHaveBeenCalledTimes(1);
  });
});
