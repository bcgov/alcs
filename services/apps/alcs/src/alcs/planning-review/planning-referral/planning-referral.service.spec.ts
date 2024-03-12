import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { Repository } from 'typeorm';
import { Board } from '../../board/board.entity';
import { Card } from '../../card/card.entity';
import { CardService } from '../../card/card.service';
import { PlanningReview } from '../planning-review.entity';
import { PlanningReferral } from './planning-referral.entity';
import { PlanningReferralService } from './planning-referral.service';

describe('PlanningReferralService', () => {
  let service: PlanningReferralService;
  let mockRepository: DeepMocked<Repository<PlanningReferral>>;
  let mockReviewRepository: DeepMocked<Repository<PlanningReview>>;
  let mockCardService: DeepMocked<CardService>;

  beforeEach(async () => {
    mockCardService = createMock();
    mockReviewRepository = createMock();
    mockRepository = createMock();

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
          provide: getRepositoryToken(PlanningReview),
          useValue: mockReviewRepository,
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

  it('should load the review then call save for create', async () => {
    mockReviewRepository.findOneOrFail.mockResolvedValue(new PlanningReview());
    mockCardService.create.mockResolvedValue(new Card());
    mockRepository.save.mockResolvedValue(new PlanningReferral());
    mockRepository.findOneOrFail.mockResolvedValue(new PlanningReferral());

    await service.create(
      {
        referralDescription: '',
        submissionDate: 0,
        planningReviewUuid: 'uuid',
      },
      new Board(),
    );

    expect(mockReviewRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockCardService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should load the review then update its values for update', async () => {
    const mockReferral = new PlanningReferral();
    mockRepository.save.mockResolvedValue(mockReferral);
    mockRepository.findOneOrFail.mockResolvedValue(mockReferral);

    const newDescription = 'newDescription';

    await service.update('', {
      referralDescription: newDescription,
      submissionDate: 0,
    });

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockReferral.referralDescription).toEqual(newDescription);
  });

  it('should call through for delete', async () => {
    const mockReferral = new PlanningReferral();
    mockRepository.softRemove.mockResolvedValue(mockReferral);
    mockRepository.findOneOrFail.mockResolvedValue(mockReferral);

    await service.delete('mock-uuid');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepository.softRemove).toHaveBeenCalledTimes(1);
  });
});
