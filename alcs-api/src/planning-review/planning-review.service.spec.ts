import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { CodeService } from '../code/code.service';
import { PlanningReview } from './planning-review.entity';
import { PlanningReviewService } from './planning-review.service';

describe('PlanningReviewService', () => {
  let service: PlanningReviewService;
  let mockRepository: DeepMocked<Repository<PlanningReview>>;
  let mockCardService: DeepMocked<CardService>;
  let mockCodeService: DeepMocked<CodeService>;

  beforeEach(async () => {
    mockCardService = createMock<CardService>();
    mockCodeService = createMock<CodeService>();
    mockRepository = createMock<Repository<PlanningReview>>();

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
          provide: CardService,
          useValue: mockCardService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
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
    const regionUuid = 'region-uuid';
    const fakeBoard = {} as Board;

    mockRepository.findOne.mockResolvedValueOnce(undefined);
    mockRepository.findOne.mockResolvedValueOnce({} as PlanningReview);
    mockRepository.save.mockResolvedValue({} as PlanningReview);
    mockCardService.create.mockResolvedValue(mockCard);
    mockCodeService.fetchRegion.mockResolvedValue({
      uuid: regionUuid,
    } as ApplicationRegion);

    const res = await service.create(
      {
        type: 'fake-type',
        fileNumber: '1512311',
        localGovernmentUuid: 'fake-uuid',
        regionCode: 'region-code',
      },
      fakeBoard,
    );

    expect(mockRepository.findOne).toHaveBeenCalled();
    expect(mockCardService.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockRepository.save.mock.calls[0][0].regionUuid).toEqual(regionUuid);
    expect(mockRepository.save.mock.calls[0][0].card).toBe(mockCard);
  });

  it('should throw an exception when creating a meeting with an existing file ID', async () => {
    const mockCard = {} as Card;
    const fakeBoard = {} as Board;
    const existingFileNumber = '1512311';

    mockRepository.findOne.mockResolvedValueOnce({} as PlanningReview);
    mockRepository.save.mockResolvedValue({} as PlanningReview);
    mockCardService.create.mockResolvedValue(mockCard);

    const promise = service.create(
      {
        type: 'fake-type',
        fileNumber: existingFileNumber,
        localGovernmentUuid: 'fake-uuid',
        regionCode: 'region-code',
      },
      fakeBoard,
    );

    await expect(promise).rejects.toMatchObject(
      new Error(
        `Planning meeting already exists with File ID ${existingFileNumber}`,
      ),
    );

    expect(mockRepository.findOne).toHaveBeenCalled();
    expect(mockCardService.create).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should call through to the repo for get by card', async () => {
    mockRepository.findOne.mockResolvedValue({} as PlanningReview);
    const cardUuid = 'fake-card-uuid';
    await service.getByCardUuid(cardUuid);

    expect(mockRepository.findOne).toHaveBeenCalled();
  });

  it('should throw an exception when getting by card fails', async () => {
    mockRepository.findOne.mockResolvedValue(undefined);
    const cardUuid = 'fake-card-uuid';
    const promise = service.getByCardUuid(cardUuid);

    await expect(promise).rejects.toMatchObject(
      new Error(`Failed to find planning meeting with card uuid ${cardUuid}`),
    );

    expect(mockRepository.findOne).toHaveBeenCalled();
  });

  it('should call through to the repo for get cards', async () => {
    mockRepository.find.mockResolvedValue([]);
    await service.getCards();

    expect(mockRepository.find).toHaveBeenCalled();
  });
});
