import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initCardStatusMockEntity } from '../../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../../common/utils/test-helpers/mockTypes';
import { ApplicationTimeTrackingService } from '../application-time-tracking.service';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { CardStatusDto } from './card-status.dto';
import { CardStatus } from './card-status.entity';
import { CardStatusService } from './card-status.service';

describe('CardStatusService', () => {
  let cardStatusService: CardStatusService;
  let cardStatusRepositoryMock: MockType<Repository<CardStatus>>;
  let applicationService: ApplicationService;

  const cardStatusDto: CardStatusDto = {
    code: 'app_1',
    description: 'app desc 1',
    label: 'app_label',
  };
  const cardStatusMockEntity = initCardStatusMockEntity();

  beforeEach(async () => {
    applicationService = createMock<ApplicationService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardStatusService,
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: ApplicationTimeTrackingService,
          useValue: {},
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

    cardStatusRepositoryMock = module.get(getRepositoryToken(CardStatus));
    cardStatusService = module.get<CardStatusService>(CardStatusService);
    applicationService = module.get<ApplicationService>(ApplicationService);

    cardStatusRepositoryMock.findOne.mockReturnValue(cardStatusMockEntity);
    cardStatusRepositoryMock.save.mockReturnValue(cardStatusMockEntity);
    cardStatusRepositoryMock.find.mockReturnValue([cardStatusMockEntity]);
  });

  it('should be defined', () => {
    expect(cardStatusService).toBeDefined();
    expect(applicationService).toBeDefined();
  });

  it('should create card_status', async () => {
    expect(await cardStatusService.create(cardStatusDto)).toStrictEqual(
      cardStatusMockEntity,
    );
  });
});
