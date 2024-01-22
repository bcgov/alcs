import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationDecisionComponentLotController } from './application-decision-component-lot.controller';
import { UpdateApplicationDecisionComponentLotDto } from './application-decision-component-lot.dto';
import { ApplicationDecisionComponentLot } from './application-decision-component-lot.entity';
import { ApplicationDecisionComponentLotService } from './application-decision-component-lot.service';

describe('ApplicationDecisionComponentLotController', () => {
  let controller: ApplicationDecisionComponentLotController;
  let mockApplicationDecisionComponentLotService: DeepMocked<ApplicationDecisionComponentLotService>;

  beforeEach(async () => {
    mockApplicationDecisionComponentLotService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationDecisionComponentLotController],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationDecisionProfile,
        {
          provide: ApplicationDecisionComponentLotService,
          useValue: mockApplicationDecisionComponentLotService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationDecisionComponentLotController>(
      ApplicationDecisionComponentLotController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should successfully call service to update', async () => {
    mockApplicationDecisionComponentLotService.update.mockResolvedValue(
      new ApplicationDecisionComponentLot(),
    );

    const updateDto = {
      type: 'Lot',
      alrArea: 1,
      size: 1,
      uuid: 'fake',
    } as UpdateApplicationDecisionComponentLotDto;

    const result = await controller.update('fake', updateDto);

    expect(result).toBeDefined();
    expect(mockApplicationDecisionComponentLotService.update).toBeCalledTimes(
      1,
    );
    expect(mockApplicationDecisionComponentLotService.update).toBeCalledWith(
      'fake',
      updateDto,
    );
  });
});
