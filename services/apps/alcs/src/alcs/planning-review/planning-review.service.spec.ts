import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileNumberService } from '../../file-number/file-number.service';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { PlanningReferral } from './planning-referral/planning-referral.entity';
import { PlanningReviewType } from './planning-review-type.entity';
import { PlanningReview } from './planning-review.entity';
import { PlanningReviewService } from './planning-review.service';

describe('PlanningReviewService', () => {
  let service: PlanningReviewService;
  let mockRepository: DeepMocked<Repository<PlanningReview>>;
  let mockTypeRepository: DeepMocked<Repository<PlanningReviewType>>;
  let mockReferralRepository: DeepMocked<Repository<PlanningReferral>>;
  let mockCardService: DeepMocked<CardService>;
  let mockFileNumberService: DeepMocked<FileNumberService>;

  beforeEach(async () => {
    mockCardService = createMock();
    mockRepository = createMock();
    mockTypeRepository = createMock();
    mockReferralRepository = createMock();
    mockFileNumberService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(PlanningReview),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(PlanningReviewType),
          useValue: mockTypeRepository,
        },
        {
          provide: getRepositoryToken(PlanningReferral),
          useValue: mockReferralRepository,
        },
        {
          provide: FileNumberService,
          useValue: mockFileNumberService,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
        PlanningReviewService,
      ],
    }).compile();

    service = module.get<PlanningReviewService>(PlanningReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load the type code and call the repo to save when creating', async () => {
    const mockCard = {} as Card;
    const fakeBoard = {} as Board;

    mockFileNumberService.generateNextFileNumber.mockResolvedValue(1);
    mockTypeRepository.findOneOrFail.mockResolvedValue(
      new PlanningReviewType(),
    );
    mockRepository.save.mockResolvedValue({} as PlanningReview);
    mockCardService.create.mockResolvedValue(mockCard);
    mockReferralRepository.save.mockResolvedValue(new PlanningReferral());

    await service.create(
      {
        description: '',
        documentName: '',
        submissionDate: 0,
        typeCode: '',
        localGovernmentUuid: 'fake-uuid',
        regionCode: 'region-code',
      },
      fakeBoard,
    );

    expect(mockFileNumberService.generateNextFileNumber).toHaveBeenCalledTimes(
      1,
    );
    expect(mockTypeRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockCardService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockReferralRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for getby', async () => {
    const mockFilter = {
      uuid: '5',
    };
    mockRepository.find.mockResolvedValue([]);

    await service.getBy(mockFilter);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.find.mock.calls[0][0]!.where).toEqual(mockFilter);
  });

  it('should call through to the repo for getDetailedReview', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(new PlanningReview());

    await service.getDetailedReview('file-number');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
  });
});
