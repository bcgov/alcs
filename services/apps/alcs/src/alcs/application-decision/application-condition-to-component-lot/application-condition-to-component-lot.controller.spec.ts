import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationConditionToComponentLotController } from './application-condition-to-component-lot.controller';
import { ApplicationConditionToComponentLotService } from './application-condition-to-component-lot.service';
import { ApplicationDecisionConditionToComponentLot } from './application-decision-condition-to-component-lot.entity';

describe('ApplicationConditionToComponentLotController', () => {
  let controller: ApplicationConditionToComponentLotController;
  let mockApplicationConditionToComponentLotService: DeepMocked<ApplicationConditionToComponentLotService>;

  beforeEach(async () => {
    mockApplicationConditionToComponentLotService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationConditionToComponentLotController],
      providers: [
        ApplicationDecisionProfile,
        {
          provide: ApplicationConditionToComponentLotService,
          useValue: mockApplicationConditionToComponentLotService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationConditionToComponentLotController>(
      ApplicationConditionToComponentLotController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should successfully call service to update lot', async () => {
    mockApplicationConditionToComponentLotService.createOrUpdate.mockResolvedValue(
      new ApplicationDecisionConditionToComponentLot(),
    );

    const result = await controller.update('fake-1', 'fake-2', {} as any);

    expect(result).toBeDefined();
    expect(
      mockApplicationConditionToComponentLotService.createOrUpdate,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationConditionToComponentLotService.createOrUpdate,
    ).toBeCalledWith('fake-2', 'fake-1', {});
  });

  it('should successfully call service to fetch lots', async () => {
    mockApplicationConditionToComponentLotService.fetch.mockResolvedValue([
      new ApplicationDecisionConditionToComponentLot(),
    ]);

    const result = await controller.get('fake-1', 'fake-2');

    expect(result).toBeDefined();
    expect(mockApplicationConditionToComponentLotService.fetch).toBeCalledTimes(
      1,
    );
    expect(mockApplicationConditionToComponentLotService.fetch).toBeCalledWith(
      'fake-1',
      'fake-2',
    );
  });
});
