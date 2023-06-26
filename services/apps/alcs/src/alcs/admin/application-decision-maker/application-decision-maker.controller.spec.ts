import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDecisionMakerCode } from '../../application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionMakerController } from './application-decision-maker.controller';
import { ApplicationDecisionMakerService } from './application-decision-maker.service';

describe('ApplicationDecisionMakerController', () => {
  let controller: ApplicationDecisionMakerController;
  let mockDecisionMakerService: DeepMocked<ApplicationDecisionMakerService>;

  beforeEach(async () => {
    mockDecisionMakerService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationDecisionMakerController],
      providers: [
        {
          provide: ApplicationDecisionMakerService,
          useValue: mockDecisionMakerService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<ApplicationDecisionMakerController>(
      ApplicationDecisionMakerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching ceo criterion', async () => {
    mockDecisionMakerService.fetch.mockResolvedValue([]);

    const holidays = await controller.fetch();

    expect(holidays).toBeDefined();
    expect(mockDecisionMakerService.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when updating ceo criterion', async () => {
    mockDecisionMakerService.update.mockResolvedValue(
      new ApplicationDecisionMakerCode(),
    );

    const holiday = await controller.update(
      'fake',
      new ApplicationDecisionMakerCode(),
    );

    expect(holiday).toBeDefined();
    expect(mockDecisionMakerService.update).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating ceo criterion', async () => {
    mockDecisionMakerService.create.mockResolvedValue(
      new ApplicationDecisionMakerCode(),
    );

    const holiday = await controller.create(new ApplicationDecisionMakerCode());

    expect(holiday).toBeDefined();
    expect(mockDecisionMakerService.create).toHaveBeenCalledTimes(1);
  });
});
