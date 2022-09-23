import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { initCardStatusMockEntity } from '../../common/utils/test-helpers/mockEntities';
import { repositoryMockFactory } from '../../common/utils/test-helpers/mockTypes';
import { ApplicationTimeTrackingService } from '../../application/application-time-tracking.service';
import { Application } from '../../application/application.entity';
import { ApplicationService } from '../../application/application.service';
import { CardStatusController } from './card-status.controller';
import { CardStatusDto } from './card-status.dto';
import { CardStatus } from './card-status.entity';
import { CardStatusService } from './card-status.service';

describe('CardStatusController', () => {
  let controller: CardStatusController;
  let cardStatusService: CardStatusService;
  const mockCardStatusEntity = initCardStatusMockEntity();
  const cardStatusDto: CardStatusDto = {
    code: mockCardStatusEntity.code,
    description: mockCardStatusEntity.description,
    label: mockCardStatusEntity.label,
  };
  let applicationService: DeepMocked<ApplicationService>;
  let mockApplicationTimeService: DeepMocked<ApplicationTimeTrackingService>;

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardStatusController],
      providers: [
        CardStatusService,
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: ApplicationTimeTrackingService,
          useValue: mockApplicationTimeService,
        },
        {
          provide: getRepositoryToken(CardStatus),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Application),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    cardStatusService = module.get<CardStatusService>(CardStatusService);
    controller = module.get<CardStatusController>(CardStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add', async () => {
    jest
      .spyOn(cardStatusService, 'create')
      .mockImplementation(async () => mockCardStatusEntity);

    expect(await controller.add(cardStatusDto)).toStrictEqual(cardStatusDto);
  });
});
