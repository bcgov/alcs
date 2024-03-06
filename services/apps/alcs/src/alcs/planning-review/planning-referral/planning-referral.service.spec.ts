import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { Repository } from 'typeorm';
import { CardService } from '../../card/card.service';
import { PlanningReferral } from './planning-referral.entity';
import { PlanningReferralService } from './planning-referral.service';

describe('PlanningReferralService', () => {
  let service: PlanningReferralService;
  let mockRepository: DeepMocked<Repository<PlanningReferral>>;
  let mockCardService: DeepMocked<CardService>;

  beforeEach(async () => {
    mockCardService = createMock<CardService>();
    mockRepository = createMock<Repository<PlanningReferral>>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(PlanningReferral),
          useValue: mockRepository,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
        PlanningReferralService,
      ],
    }).compile();

    service = module.get<PlanningReferralService>(PlanningReferralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call through to the repo for get by card', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(new PlanningReferral());
    const cardUuid = 'fake-card-uuid';
    await service.getByCardUuid(cardUuid);

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for get cards', async () => {
    mockRepository.find.mockResolvedValue([]);
    await service.getByBoard('');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should load deleted cards', async () => {
    mockRepository.find.mockResolvedValue([]);

    await service.getDeletedCards('file-number');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.find.mock.calls[0][0]!.withDeleted).toEqual(true);
  });
});
