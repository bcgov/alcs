import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { NoticeOfIntent } from './notice-of-intent.entity';
import { NoticeOfIntentService } from './notice-of-intent.service';

describe('NoticeOfIntentService', () => {
  let service: NoticeOfIntentService;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockCardService: DeepMocked<CardService>;
  let mockRepository: DeepMocked<Repository<NoticeOfIntent>>;

  beforeEach(async () => {
    mockAppService = createMock();
    mockCardService = createMock();
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoticeOfIntentService,
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: mockRepository,
        },
        {
          provide: CardService,
          useValue: mockCardService,
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

    mockRepository.findOne.mockResolvedValueOnce(null);
    mockRepository.findOne.mockResolvedValueOnce(new NoticeOfIntent());
    mockRepository.save.mockResolvedValue(new NoticeOfIntent());
    mockCardService.create.mockResolvedValue(mockCard);
    mockAppService.get.mockResolvedValue(null);

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

    expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
    expect(mockCardService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].card).toBe(mockCard);
  });

  it('should throw an exception when creating an NOI with an existing file ID', async () => {
    const mockCard = {} as Card;
    const fakeBoard = {} as Board;
    const existingFileNumber = '1512311';

    mockRepository.findOne.mockResolvedValueOnce(new NoticeOfIntent());
    mockRepository.save.mockResolvedValue(new NoticeOfIntent());
    mockCardService.create.mockResolvedValue(mockCard);

    const promise = service.create(
      {
        applicant: 'fake-applicant',
        fileNumber: existingFileNumber,
        localGovernmentUuid: 'fake-uuid',
        regionCode: 'region-code',
        boardCode: 'fake',
        dateSubmittedToAlc: 0,
      },
      fakeBoard,
    );

    await expect(promise).rejects.toMatchObject(
      new Error(
        `Notice of Intent already exists with File ID ${existingFileNumber}`,
      ),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockCardService.create).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw an exception when creating a notice of intent with an existing application file ID', async () => {
    const mockCard = {} as Card;
    const fakeBoard = {} as Board;
    const existingFileNumber = '1512311';

    mockRepository.findOne.mockResolvedValue(null);
    mockAppService.get.mockResolvedValue(new Application());
    mockRepository.save.mockResolvedValue(new NoticeOfIntent());
    mockCardService.create.mockResolvedValue(mockCard);

    const promise = service.create(
      {
        applicant: 'fake-applicant',
        fileNumber: existingFileNumber,
        localGovernmentUuid: 'fake-uuid',
        regionCode: 'region-code',
        boardCode: 'fake',
        dateSubmittedToAlc: 0,
      },
      fakeBoard,
    );

    await expect(promise).rejects.toMatchObject(
      new Error(
        `Application already exists with File ID ${existingFileNumber}`,
      ),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockCardService.create).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
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
    await service.getByBoardCode('fake');

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
});
