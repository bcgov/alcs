import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { PlanningReviewProfile } from '../../common/automapper/planning-review.automapper.profile';
import { FileNumberService } from '../../file-number/file-number.service';
import { Board } from '../board/board.entity';
import { BoardService } from '../board/board.service';
import { PlanningReferral } from './planning-referral/planning-referral.entity';
import { PlanningReferralService } from './planning-referral/planning-referral.service';
import { PlanningReviewController } from './planning-review.controller';
import { PlanningReview } from './planning-review.entity';
import { PlanningReviewService } from './planning-review.service';

describe('PlanningReviewController', () => {
  let controller: PlanningReviewController;
  let mockService: DeepMocked<PlanningReviewService>;
  let mockPlanningReferralService: DeepMocked<PlanningReferralService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockService = createMock();
    mockBoardService = createMock();
    mockPlanningReferralService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [PlanningReviewController],
      providers: [
        PlanningReviewProfile,
        {
          provide: PlanningReviewService,
          useValue: mockService,
        },
        {
          provide: PlanningReferralService,
          useValue: mockPlanningReferralService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<PlanningReviewController>(PlanningReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call board service then main service for create', async () => {
    mockBoardService.getOneOrFail.mockResolvedValue({} as Board);
    mockService.create.mockResolvedValue(new PlanningReferral());
    mockPlanningReferralService.get.mockResolvedValue(new PlanningReferral());
    mockPlanningReferralService.mapToDtos.mockResolvedValue([]);

    await controller.create({
      description: 'description',
      documentName: 'documentName',
      submissionDate: 0,
      typeCode: 'typeCode',
      localGovernmentUuid: 'local-gov-uuid',
      regionCode: 'region-code',
    });

    expect(mockBoardService.getOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockService.create).toHaveBeenCalledTimes(1);
    expect(mockPlanningReferralService.get).toHaveBeenCalledTimes(1);
    expect(mockPlanningReferralService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call service for fetch types', async () => {
    mockService.listTypes.mockResolvedValue([]);

    await controller.fetchTypes();

    expect(mockService.listTypes).toHaveBeenCalledTimes(1);
  });

  it('should call service for fetch by file number', async () => {
    mockService.getDetailedReview.mockResolvedValue(new PlanningReview());

    await controller.fetchByFileNumber('file-number');

    expect(mockService.getDetailedReview).toHaveBeenCalledTimes(1);
  });
});
