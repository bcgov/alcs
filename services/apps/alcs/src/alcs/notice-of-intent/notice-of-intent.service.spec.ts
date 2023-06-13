import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentProfile } from '../../common/automapper/notice-of-intent.automapper.profile';
import { FileNumberService } from '../../file-number/file-number.service';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { NoticeOfIntentSubtype } from './notice-of-intent-subtype.entity';
import { NoticeOfIntent } from './notice-of-intent.entity';
import { NoticeOfIntentService } from './notice-of-intent.service';

describe('NoticeOfIntentService', () => {
  let service: NoticeOfIntentService;
  let mockCardService: DeepMocked<CardService>;
  let mockRepository: DeepMocked<Repository<NoticeOfIntent>>;
  let mockSubtypeRepository: DeepMocked<Repository<NoticeOfIntentSubtype>>;
  let mockFileNumberService: DeepMocked<FileNumberService>;

  beforeEach(async () => {
    mockCardService = createMock();
    mockRepository = createMock();
    mockFileNumberService = createMock();
    mockSubtypeRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoticeOfIntentService,
        NoticeOfIntentProfile,
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentSubtype),
          useValue: mockSubtypeRepository,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
        {
          provide: FileNumberService,
          useValue: mockFileNumberService,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentService>(NoticeOfIntentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load the type code and call the repo to save when creating', async () => {
    const mockCard = {} as Card;
    const fakeBoard = {} as Board;

    mockRepository.findOne.mockResolvedValue(new NoticeOfIntent());
    mockRepository.save.mockResolvedValue(new NoticeOfIntent());
    mockCardService.create.mockResolvedValue(mockCard);
    mockFileNumberService.checkValidFileNumber.mockResolvedValue(true);

    const res = await service.create(
      {
        applicant: 'fake-applicant',
        fileNumber: '1512311',
        localGovernmentUuid: 'fake-uuid',
        regionCode: 'region-code',
        boardCode: 'fake',
        dateSubmittedToAlc: 0,
      },
      fakeBoard,
    );

    expect(mockFileNumberService.checkValidFileNumber).toHaveBeenCalledTimes(1);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockCardService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].card).toBe(mockCard);
  });

  it('should call through to the repo for get by card', async () => {
    mockRepository.findOne.mockResolvedValue(new NoticeOfIntent());
    const cardUuid = 'fake-card-uuid';
    await service.getByCardUuid(cardUuid);

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when getting by card fails', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const cardUuid = 'fake-card-uuid';
    const promise = service.getByCardUuid(cardUuid);

    await expect(promise).rejects.toMatchObject(
      new Error(`Failed to find notice of intent with card uuid ${cardUuid}`),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for get cards', async () => {
    mockRepository.find.mockResolvedValue([]);
    await service.getByBoard('fake');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for getBy', async () => {
    const mockFilter = {
      uuid: '5',
    };
    mockRepository.find.mockResolvedValue([]);
    await service.getBy(mockFilter);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.find.mock.calls[0][0]!.where).toEqual(mockFilter);
  });

  it('should call through to the repo for getByFileNumber', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(new NoticeOfIntent());
    await service.getByFileNumber('file');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should set values and call save for update', async () => {
    const notice = new NoticeOfIntent({
      summary: 'old-summary',
    });
    mockRepository.findOneOrFail.mockResolvedValue(notice);
    mockRepository.save.mockResolvedValue(new NoticeOfIntent());
    const res = await service.update('file', {
      summary: 'new-summary',
    });

    expect(res).toBeDefined();
    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(2);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(notice.summary).toEqual('new-summary');
  });

  it('should load deleted cards', async () => {
    mockRepository.find.mockResolvedValue([]);

    await service.getDeletedCards('file-number');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.find.mock.calls[0][0]!.withDeleted).toEqual(true);
  });

  it('should call the subtype repo for list', async () => {
    mockSubtypeRepository.find.mockResolvedValue([]);

    await service.listSubtypes();

    expect(mockSubtypeRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should call map active and paused times for mapToDtos', async () => {
    const noi = new NoticeOfIntent({
      uuid: '5',
    });
    const mockQueryResult: {
      noi_uuid: string;
      paused_days: number;
      active_days: number;
    }[] = [
      {
        active_days: 1,
        paused_days: 5,
        noi_uuid: '5',
      },
    ];
    mockRepository.query.mockResolvedValue(mockQueryResult);

    const res = await service.mapToDtos([noi]);

    expect(mockRepository.query).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].uuid).toEqual('5');
    expect(res[0].activeDays).toEqual(1);
    expect(res[0].pausedDays).toEqual(5);
    expect(res[0].paused).toEqual(true);
  });
});
