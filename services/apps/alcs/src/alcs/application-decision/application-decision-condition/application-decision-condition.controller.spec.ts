import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationDecisionConditionController } from './application-decision-condition.controller';
import { UpdateApplicationDecisionConditionDto } from './application-decision-condition.dto';
import { ApplicationDecisionCondition } from './application-decision-condition.entity';
import { ApplicationDecisionConditionService } from './application-decision-condition.service';

describe('ApplicationDecisionConditionController', () => {
  let controller: ApplicationDecisionConditionController;
  let mockApplicationDecisionConditionService: DeepMocked<ApplicationDecisionConditionService>;

  beforeEach(async () => {
    mockApplicationDecisionConditionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionConditionController],
      providers: [
        ApplicationDecisionProfile,
        {
          provide: ApplicationDecisionConditionService,
          useValue: mockApplicationDecisionConditionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationDecisionConditionController>(
      ApplicationDecisionConditionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    it('should update the condition and return updated condition', async () => {
      // Arrange
      const uuid = 'example-uuid';
      const date = new Date();
      const updates: UpdateApplicationDecisionConditionDto = {
        approvalDependant: true,
        securityAmount: 1000,
        administrativeFee: 50,
        description: 'example description',
        completionDate: date.getTime(),
        supersededDate: date.getTime(),
      };

      const condition = new ApplicationDecisionCondition({
        uuid,
        approvalDependant: false,
        securityAmount: 500,
        administrativeFee: 25,
        description: 'existing description',
        completionDate: new Date(),
        supersededDate: new Date(),
      });

      const updated = new ApplicationDecisionCondition({
        uuid,
        approvalDependant: updates.approvalDependant,
        securityAmount: updates.securityAmount,
        administrativeFee: updates.administrativeFee,
        description: updates.description,
        completionDate: date,
        supersededDate: date,
      });

      mockApplicationDecisionConditionService.getOneOrFail.mockResolvedValue(
        condition,
      );
      mockApplicationDecisionConditionService.update.mockResolvedValue(updated);

      const result = await controller.update(uuid, updates);

      expect(
        mockApplicationDecisionConditionService.getOneOrFail,
      ).toHaveBeenCalledWith(uuid);
      expect(
        mockApplicationDecisionConditionService.update,
      ).toHaveBeenCalledWith(condition, {
        ...updates,
        completionDate: date,
        supersededDate: date,
      });
      expect(new Date(result.completionDate!)).toEqual(updated.completionDate);
      expect(new Date(result.supersededDate!)).toEqual(updated.supersededDate);
      expect(result.description).toEqual(updated.description);
      expect(result.administrativeFee).toEqual(updated.administrativeFee);
      expect(result.securityAmount).toEqual(updated.securityAmount);
      expect(result.approvalDependant).toEqual(updated.approvalDependant);
    });
  });
});
