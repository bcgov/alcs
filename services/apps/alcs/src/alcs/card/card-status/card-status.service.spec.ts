import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionMakerCode } from '../../application-decision/application-decision-maker/application-decision-maker.entity';
import { CardService } from '../card.service';
import { CardStatus } from './card-status.entity';
import { CardStatusService } from './card-status.service';

describe('CardStatusService', () => {
  let service: CardStatusService;
  let mockRepository: DeepMocked<Repository<CardStatus>>;
  let mockCardService: DeepMocked<CardService>;

  const cardStatus = new CardStatus();

  beforeEach(async () => {
    mockRepository = createMock();
    mockCardService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        CardStatusService,
        {
          provide: getRepositoryToken(CardStatus),
          useValue: mockRepository,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
      ],
    }).compile();

    service = module.get<CardStatusService>(CardStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully create card status', async () => {
    mockRepository.save.mockResolvedValue(new ApplicationDecisionMakerCode());

    const result = await service.create({
      code: '',
      description: '',
      label: '',
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should successfully update card status if it exists', async () => {
    mockRepository.save.mockResolvedValue(cardStatus);
    mockRepository.findOneOrFail.mockResolvedValue(cardStatus);

    const result = await service.update(cardStatus.code, {
      code: '',
      description: '',
      label: '',
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: cardStatus.code },
    });
    expect(result).toBeDefined();
  });

  it('should successfully fetch card status', async () => {
    mockRepository.find.mockResolvedValue([cardStatus]);

    const result = await service.fetch();

    expect(mockRepository.find).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });
});
