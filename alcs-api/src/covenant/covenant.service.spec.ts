import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { Covenant } from './covenant.entity';
import { CovenantService } from './covenant.service';

describe('CovenantService', () => {
  let service: CovenantService;
  let mockRepository: DeepMocked<Repository<Covenant>>;
  let mockCardService: DeepMocked<CardService>;

  beforeEach(async () => {
    mockCardService = createMock<CardService>();
    mockRepository = createMock<Repository<Covenant>>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(Covenant),
          useValue: mockRepository,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
        CovenantService,
      ],
    }).compile();

    service = module.get<CovenantService>(CovenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load the type code and call the repo to save when creating', async () => {
    const mockCard = {} as Card;
    const fakeBoard = {} as Board;

    mockRepository.findOne.mockResolvedValueOnce(undefined);
    mockRepository.findOne.mockResolvedValueOnce({} as Covenant);
    mockRepository.save.mockResolvedValue({} as Covenant);
    mockCardService.create.mockResolvedValue(mockCard);

    const res = await service.create(
      {
        applicant: 'fake-applicant',
        fileNumber: '1512311',
        localGovernmentUuid: 'fake-uuid',
        regionCode: 'region-code',
      },
      fakeBoard,
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
    expect(mockCardService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].card).toBe(mockCard);
  });

  it('should throw an exception when creating a meeting with an existing file ID', async () => {
    const mockCard = {} as Card;
    const fakeBoard = {} as Board;
    const existingFileNumber = '1512311';

    mockRepository.findOne.mockResolvedValueOnce({} as Covenant);
    mockRepository.save.mockResolvedValue({} as Covenant);
    mockCardService.create.mockResolvedValue(mockCard);

    const promise = service.create(
      {
        applicant: 'fake-applicant',
        fileNumber: existingFileNumber,
        localGovernmentUuid: 'fake-uuid',
        regionCode: 'region-code',
      },
      fakeBoard,
    );

    await expect(promise).rejects.toMatchObject(
      new Error(`Covenant already exists with File ID ${existingFileNumber}`),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockCardService.create).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should call through to the repo for get by card', async () => {
    mockRepository.findOne.mockResolvedValue({} as Covenant);
    const cardUuid = 'fake-card-uuid';
    await service.getByCardUuid(cardUuid);

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when getting by card fails', async () => {
    mockRepository.findOne.mockResolvedValue(undefined);
    const cardUuid = 'fake-card-uuid';
    const promise = service.getByCardUuid(cardUuid);

    await expect(promise).rejects.toMatchObject(
      new Error(`Failed to find covenant with card uuid ${cardUuid}`),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for get cards', async () => {
    mockRepository.find.mockResolvedValue([]);
    await service.getByBoardCode('fake');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for getby', async () => {
    const mockFilter = {
      uuid: '5',
    };
    mockRepository.find.mockResolvedValue([]);
    await service.getBy(mockFilter);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.find.mock.calls[0][0].where).toEqual(mockFilter);
  });
});
