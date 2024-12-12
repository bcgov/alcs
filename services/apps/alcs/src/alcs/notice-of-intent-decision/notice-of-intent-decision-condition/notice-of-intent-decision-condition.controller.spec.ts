import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentDecisionProfile } from '../../../common/automapper/notice-of-intent-decision.automapper.profile';
import { NoticeOfIntentDecisionConditionController } from './notice-of-intent-decision-condition.controller';
import { UpdateNoticeOfIntentDecisionConditionDto } from './notice-of-intent-decision-condition.dto';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionService } from './notice-of-intent-decision-condition.service';

describe('NoticeOfIntentDecisionConditionController', () => {
  let controller: NoticeOfIntentDecisionConditionController;
  let mockNOIDecisionConditionService: DeepMocked<NoticeOfIntentDecisionConditionService>;

  beforeEach(async () => {
    mockNOIDecisionConditionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentDecisionConditionController],
      providers: [
        NoticeOfIntentDecisionProfile,
        {
          provide: NoticeOfIntentDecisionConditionService,
          useValue: mockNOIDecisionConditionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentDecisionConditionController>(NoticeOfIntentDecisionConditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    it('should update the condition and return updated condition', async () => {
      // Arrange
      const uuid = 'example-uuid';
      const date = new Date();
      const updates: UpdateNoticeOfIntentDecisionConditionDto = {
        approvalDependant: true,
        securityAmount: 1000,
        administrativeFee: 50,
        description: 'example description',
      };

      const condition = new NoticeOfIntentDecisionCondition({
        uuid,
        approvalDependant: false,
        securityAmount: 500,
        administrativeFee: 25,
        description: 'existing description',
      });

      const updated = new NoticeOfIntentDecisionCondition({
        uuid,
        approvalDependant: updates.approvalDependant,
        securityAmount: updates.securityAmount,
        administrativeFee: updates.administrativeFee,
        description: updates.description,
      });

      mockNOIDecisionConditionService.getOneOrFail.mockResolvedValue(condition);
      mockNOIDecisionConditionService.update.mockResolvedValue(updated);

      const result = await controller.update(uuid, updates);

      expect(mockNOIDecisionConditionService.getOneOrFail).toHaveBeenCalledWith(uuid);
      expect(mockNOIDecisionConditionService.update).toHaveBeenCalledWith(condition, {
        ...updates,
      });
      expect(result.description).toEqual(updated.description);
      expect(result.administrativeFee).toEqual(updated.administrativeFee);
      expect(result.securityAmount).toEqual(updated.securityAmount);
      expect(result.approvalDependant).toEqual(updated.approvalDependant);
    });
  });
});
