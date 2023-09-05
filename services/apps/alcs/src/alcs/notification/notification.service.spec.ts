import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../../../../libs/common/src/exceptions/base.exception';
import { NotificationProfile } from '../../common/automapper/notification.automapper.profile';
import { FileNumberService } from '../../file-number/file-number.service';
import { NotificationSubmissionService } from '../../portal/notification-submission/notification-submission.service';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { CodeService } from '../code/code.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { NotificationType } from './notification-type/notification-type.entity';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockCardService: DeepMocked<CardService>;
  let mockRepository: DeepMocked<Repository<Notification>>;
  let mockTypeRepository: DeepMocked<Repository<NotificationType>>;
  let mockFileNumberService: DeepMocked<FileNumberService>;
  let mockLocalGovernmentService: DeepMocked<LocalGovernmentService>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;

  beforeEach(async () => {
    mockCardService = createMock();
    mockRepository = createMock();
    mockFileNumberService = createMock();
    mockTypeRepository = createMock();
    mockLocalGovernmentService = createMock();
    mockCodeService = createMock();
    mockNotificationSubmissionService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NotificationService,
        NotificationProfile,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(NotificationType),
          useValue: mockTypeRepository,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
        {
          provide: FileNumberService,
          useValue: mockFileNumberService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load the type code and call the repo to save when creating', async () => {
    const mockCard = {} as Card;
    const fakeBoard = {} as Board;

    mockRepository.findOne.mockResolvedValue(new Notification());
    mockRepository.save.mockResolvedValue(new Notification());
    mockCardService.create.mockResolvedValue(mockCard);
    mockFileNumberService.checkValidFileNumber.mockResolvedValue(true);
    mockCodeService.fetchRegion.mockResolvedValue(new ApplicationRegion());
    mockTypeRepository.findOneOrFail.mockResolvedValue(new NotificationType());

    const res = await service.create(
      {
        applicant: 'fake-applicant',
        fileNumber: '1512311',
        localGovernmentUuid: 'fake-uuid',
        regionCode: 'region-code',
        typeCode: '',
        dateSubmittedToAlc: new Date(0),
      },
      fakeBoard,
    );

    expect(mockFileNumberService.checkValidFileNumber).toHaveBeenCalledTimes(1);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockCardService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].card).toBe(mockCard);
    expect(mockTypeRepository.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for get by card', async () => {
    mockRepository.findOne.mockResolvedValue(new Notification());
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

  it('should call throw an exception when getOrFailByUuid fails', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const promise = service.getOrFailByUuid('uuid');

    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Failed to find notice of intent with uuid uuid`,
      ),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for getByFileNumber', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(new Notification());
    await service.getByFileNumber('file');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for searchByFileNumber', async () => {
    mockRepository.find.mockResolvedValue([new Notification()]);
    const res = await service.searchByFileNumber('file');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
  });

  it('should call through to the repo for getFileNumber', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(
      new Notification({
        fileNumber: 'fileNumber',
      }),
    );
    const res = await service.getFileNumber('file');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(res).toEqual('fileNumber');
  });

  it('should call through to the repo for getUuid', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(
      new Notification({
        uuid: 'uuid',
      }),
    );
    const res = await service.getUuid('file');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(res).toEqual('uuid');
  });

  it('should set values and call save for update', async () => {
    const notice = new Notification({
      summary: 'old-summary',
    });
    mockRepository.findOneOrFail.mockResolvedValue(notice);
    mockRepository.save.mockResolvedValue(new Notification());
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

  it('should call the repo for get update applicant', async () => {
    mockRepository.update.mockResolvedValue({} as any);

    await service.updateApplicant('file-number', 'applicant');

    expect(mockRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should create a card and save it for submit', async () => {
    const mockNoi = new Notification();
    mockRepository.findOne.mockResolvedValue(mockNoi);
    mockRepository.findOneOrFail.mockResolvedValue(mockNoi);
    mockCodeService.fetchRegion.mockResolvedValue(new ApplicationRegion());
    mockRepository.save.mockResolvedValue({} as any);

    await service.submit({
      applicant: 'Bruce Wayne',
      typeCode: 'CAT',
      fileNumber: 'fileNumber',
      localGovernmentUuid: 'governmentUuid',
      regionCode: 'REGION',
    });

    expect(mockNoi.fileNumber).toEqual('fileNumber');
    expect(mockNoi.region).toBeDefined();
    expect(mockNoi.card).toBeDefined();
    expect(mockCodeService.fetchRegion).toHaveBeenCalledTimes(1);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    0;
    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
