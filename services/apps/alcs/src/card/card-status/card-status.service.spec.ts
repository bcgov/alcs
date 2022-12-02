import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initCardStatusMockEntity } from '../../../test/mocks/mockEntities';
import { CardStatusDto } from './card-status.dto';
import { CardStatus } from './card-status.entity';
import { CardStatusService } from './card-status.service';

describe('CardStatusService', () => {
  let cardStatusService: CardStatusService;
  let cardStatusRepositoryMock: DeepMocked<Repository<CardStatus>>;

  const cardStatusDto: CardStatusDto = {
    code: 'app_1',
    description: 'app desc 1',
    label: 'app_label',
  };
  const cardStatusMockEntity = initCardStatusMockEntity();

  beforeEach(async () => {
    cardStatusRepositoryMock = createMock<Repository<CardStatus>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardStatusService,
        {
          provide: getRepositoryToken(CardStatus),
          useValue: cardStatusRepositoryMock,
        },
      ],
    }).compile();

    cardStatusRepositoryMock = module.get(getRepositoryToken(CardStatus));
    cardStatusService = module.get<CardStatusService>(CardStatusService);

    cardStatusRepositoryMock.findOne.mockResolvedValue(cardStatusMockEntity);
    cardStatusRepositoryMock.save.mockResolvedValue(cardStatusMockEntity);
    cardStatusRepositoryMock.find.mockResolvedValue([cardStatusMockEntity]);
  });

  it('should be defined', () => {
    expect(cardStatusService).toBeDefined();
  });

  it('should create card_status', async () => {
    expect(await cardStatusService.create(cardStatusDto)).toStrictEqual(
      cardStatusMockEntity,
    );
  });
});
