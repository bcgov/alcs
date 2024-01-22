import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDecisionConditionType } from '../../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionTypesController } from './application-decision-condition-types.controller';
import { ApplicationDecisionConditionTypesService } from './application-decision-condition-types.service';

describe('ApplicationDecisionConditionTypesController', () => {
  let controller: ApplicationDecisionConditionTypesController;
  let mockDecTypesService: DeepMocked<ApplicationDecisionConditionTypesService>;

  beforeEach(async () => {
    mockDecTypesService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationDecisionConditionTypesController],
      providers: [
        {
          provide: ApplicationDecisionConditionTypesService,
          useValue: mockDecTypesService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<ApplicationDecisionConditionTypesController>(
      ApplicationDecisionConditionTypesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching decision condition type', async () => {
    mockDecTypesService.fetch.mockResolvedValue([]);

    const applicationDecisionConditionTypes = await controller.fetch();

    expect(applicationDecisionConditionTypes).toBeDefined();
    expect(mockDecTypesService.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when updating decision condition type', async () => {
    mockDecTypesService.update.mockResolvedValue(
      new ApplicationDecisionConditionType(),
    );

    const applicationDecisionConditionType = await controller.update(
      'fake',
      new ApplicationDecisionConditionType(),
    );

    expect(applicationDecisionConditionType).toBeDefined();
    expect(mockDecTypesService.update).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating decision condition type', async () => {
    mockDecTypesService.create.mockResolvedValue(
      new ApplicationDecisionConditionType(),
    );

    const applicationDecisionConditionType = await controller.create(
      new ApplicationDecisionConditionType(),
    );

    expect(applicationDecisionConditionType).toBeDefined();
    expect(mockDecTypesService.create).toHaveBeenCalledTimes(1);
  });
});
