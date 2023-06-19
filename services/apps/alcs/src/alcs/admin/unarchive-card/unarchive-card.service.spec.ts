import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from '../../application/application.service';
import { CovenantService } from '../../covenant/covenant.service';
import { ApplicationModificationService } from '../../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../application-decision/application-reconsideration/application-reconsideration.service';
import { PlanningReviewService } from '../../planning-review/planning-review.service';
import { UnarchiveCardService } from './unarchive-card.service';

describe('UnarchiveCardService', () => {
  let service: UnarchiveCardService;

  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockPlanningReviewService: DeepMocked<PlanningReviewService>;
  let mockModificationService: DeepMocked<ApplicationModificationService>;
  let mockCovenantService: DeepMocked<CovenantService>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockReconsiderationService = createMock();
    mockPlanningReviewService = createMock();
    mockModificationService = createMock();
    mockCovenantService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        UnarchiveCardService,
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconsiderationService,
        },
        {
          provide: PlanningReviewService,
          useValue: mockPlanningReviewService,
        },
        {
          provide: ApplicationModificationService,
          useValue: mockModificationService,
        },
        {
          provide: CovenantService,
          useValue: mockCovenantService,
        },
      ],
    }).compile();

    service = module.get<UnarchiveCardService>(UnarchiveCardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load from each service for fetch', async () => {
    mockApplicationService.getDeletedCard.mockResolvedValue(null);
    mockReconsiderationService.getDeletedCards.mockResolvedValue([]);
    mockPlanningReviewService.getDeletedCards.mockResolvedValue([]);
    mockModificationService.getDeletedCards.mockResolvedValue([]);
    mockCovenantService.getDeletedCards.mockResolvedValue([]);

    const res = await service.fetchByFileId('uuid');

    expect(mockApplicationService.getDeletedCard).toHaveBeenCalledTimes(1);
    expect(mockReconsiderationService.getDeletedCards).toHaveBeenCalledTimes(1);
    expect(mockPlanningReviewService.getDeletedCards).toHaveBeenCalledTimes(1);
    expect(mockModificationService.getDeletedCards).toHaveBeenCalledTimes(1);
    expect(mockCovenantService.getDeletedCards).toHaveBeenCalledTimes(1);
  });
});
