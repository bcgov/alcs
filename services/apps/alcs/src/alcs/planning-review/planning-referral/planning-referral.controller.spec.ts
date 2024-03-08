import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { PlanningReviewProfile } from '../../../common/automapper/planning-review.automapper.profile';
import { PlanningReviewType } from '../planning-review-type.entity';
import { PlanningReferralController } from './planning-referral.controller';
import { PlanningReferral } from './planning-referral.entity';
import { PlanningReferralService } from './planning-referral.service';

describe('PlanningReviewController', () => {
  let controller: PlanningReferralController;
  let mockService: DeepMocked<PlanningReferralService>;

  beforeEach(async () => {
    mockService = createMock();

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
});
