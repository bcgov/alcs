import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { PlanningReviewProfile } from '../../../common/automapper/planning-review.automapper.profile';
import { Board } from '../../board/board.entity';
import { BoardService } from '../../board/board.service';
import { PlanningReviewType } from '../planning-review-type.entity';
import { PlanningReferralController } from './planning-referral.controller';
import { PlanningReferral } from './planning-referral.entity';
import { PlanningReferralService } from './planning-referral.service';

describe('PlanningReviewController', () => {
  let controller: PlanningReferralController;
  let mockService: DeepMocked<PlanningReferralService>;
  let mockBoardService: DeepMocked<BoardService>;

  beforeEach(async () => {
    mockService = createMock();
    mockBoardService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [PlanningReferralController],
      providers: [
        PlanningReviewProfile,
        {
          provide: PlanningReferralService,
          useValue: mockService,
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

    controller = module.get<PlanningReferralController>(
      PlanningReferralController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for fetchByCardUuid', async () => {
    mockService.getByCardUuid.mockResolvedValue(new PlanningReferral());

    const res = await controller.fetchByCardUuid('uuid');

    expect(res).toBeDefined();
    expect(mockService.getByCardUuid).toHaveBeenCalledTimes(1);
  });

  it('should load the board then call through for create', async () => {
    mockService.create.mockResolvedValue(new PlanningReferral());
    mockBoardService.getOneOrFail.mockResolvedValue(new Board());

    const res = await controller.create({
      planningReviewUuid: '',
      referralDescription: '',
      submissionDate: 0,
    });

    expect(res).toBeDefined();
    expect(mockBoardService.getOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockService.create).toHaveBeenCalledTimes(1);
  });

  it('should call through for update', async () => {
    mockService.update.mockResolvedValue();

    const res = await controller.update('', {
      referralDescription: '',
      submissionDate: 0,
    });

    expect(res).toBeDefined();
    expect(mockService.update).toHaveBeenCalledTimes(1);
  });

  it('should call through for delete', async () => {
    mockService.delete.mockResolvedValue();

    const res = await controller.delete('');

    expect(res).toBeDefined();
    expect(mockService.delete).toHaveBeenCalledTimes(1);
  });
});
