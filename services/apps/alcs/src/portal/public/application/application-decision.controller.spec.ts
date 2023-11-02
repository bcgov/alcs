import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDecisionV2Service } from '../../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecision } from '../../../alcs/application-decision/application-decision.entity';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationDecisionController } from './application-decision.controller';

describe('ApplicationDecisionController', () => {
  let controller: ApplicationDecisionController;
  let mockDecisionService: DeepMocked<ApplicationDecisionV2Service>;

  beforeEach(async () => {
    mockDecisionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionController],
      providers: [
        ApplicationDecisionProfile,
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();
    controller = module.get<ApplicationDecisionController>(
      ApplicationDecisionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for loading decisions', async () => {
    mockDecisionService.getForPortal.mockResolvedValue([
      new ApplicationDecision(),
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
