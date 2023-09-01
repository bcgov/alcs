import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsRelations, IsNull, Repository } from 'typeorm';
import { ModificationProfile } from '../../../common/automapper/modification.automapper.profile';
import { Board } from '../../board/board.entity';
import { CARD_TYPE } from '../../card/card-type/card-type.entity';
import { Card } from '../../card/card.entity';
import { CardService } from '../../card/card.service';
import { NoticeOfIntent } from '../../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';
import { NoticeOfIntentDecisionV1Service } from '../notice-of-intent-decision-v1/notice-of-intent-decision-v1.service';
import {
  NoticeOfIntentModificationCreateDto,
  NoticeOfIntentModificationUpdateDto,
} from './notice-of-intent-modification.dto';
import { NoticeOfIntentModification } from './notice-of-intent-modification.entity';
import { NoticeOfIntentModificationService } from './notice-of-intent-modification.service';

describe('NoticeOfIntentModificationService', () => {
  let modificationRepoMock: DeepMocked<Repository<NoticeOfIntentModification>>;
  let service: NoticeOfIntentModificationService;
  let noticeOfIntentServiceMock: DeepMocked<NoticeOfIntentService>;
  let cardServiceMock: DeepMocked<CardService>;
  let decisionServiceMock: DeepMocked<NoticeOfIntentDecisionV1Service>;

  let mockModification;
  let mockModificationCreateDto: NoticeOfIntentModificationCreateDto;

  const BOARD_RELATIONS: FindOptionsRelations<NoticeOfIntentModification> = {
    noticeOfIntent: {
      region: true,
      localGovernment: true,
    },
    card: {
      board: false,
      type: true,
      status: true,
      assignee: true,
    },
  };

  const DEFAULT_RELATIONS: FindOptionsRelations<NoticeOfIntentModification> = {
    modifiesDecisions: true,
    noticeOfIntent: {
      region: true,
      localGovernment: true,
    },
    card: {
      board: true,
      type: true,
      status: true,
      assignee: true,
    },
    resultingDecision: true,
    reviewOutcome: true,
  };

  beforeEach(async () => {
    noticeOfIntentServiceMock = createMock();
    cardServiceMock = createMock();
    modificationRepoMock = createMock();
    decisionServiceMock = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoticeOfIntentModificationService,
        {
          provide: NoticeOfIntentService,
          useValue: noticeOfIntentServiceMock,
        },
        {
          provide: CardService,
          useValue: cardServiceMock,
        },
        {
          provide: NoticeOfIntentDecisionV1Service,
          useValue: decisionServiceMock,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentModification),
          useValue: modificationRepoMock,
        },
        ModificationProfile,
      ],
    }).compile();
    service = module.get<NoticeOfIntentModificationService>(
      NoticeOfIntentModificationService,
    );

    mockModification = new NoticeOfIntentModification();
    modificationRepoMock.findOneOrFail.mockResolvedValue(mockModification);
    modificationRepoMock.findOneBy.mockResolvedValue(mockModification);
    modificationRepoMock.find.mockResolvedValue([mockModification]);
    modificationRepoMock.save.mockResolvedValue({} as any);

    noticeOfIntentServiceMock.getByFileNumber.mockResolvedValue(
      new NoticeOfIntent(),
    );

    mockModificationCreateDto = {
      fileNumber: 'fake-app-number',
      regionCode: 'fake-region',
      localGovernmentUuid: 'fake-local-government-uuid',
      applicant: 'fake-applicant',
      submittedDate: 11111111111,
      boardCode: 'fake-board',
      modifiesDecisionUuids: [],
    };

    cardServiceMock.create.mockResolvedValue(new Card());
    decisionServiceMock.getMany.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have correct filter condition in getByCode', async () => {
    const fakeBoardUuid = 'fake';
    const findOptions = {
      where: { card: { boardUuid: fakeBoardUuid } },
      relations: BOARD_RELATIONS,
    };

    await service.getByBoard(fakeBoardUuid);

    expect(modificationRepoMock.find).toBeCalledWith(findOptions);
  });

  it('should successfully create modification and link to existing application', async () => {
    await service.create(mockModificationCreateDto, {} as Board);

    expect(modificationRepoMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith(
      CARD_TYPE.NOI_MODI,
      {} as Board,
      false,
    );
    expect(noticeOfIntentServiceMock.create).toBeCalledTimes(0);
  });

  it('should successfully create modification and link to decisions', async () => {
    const decisionUuid = 'decision-uuid';

    const mockDecision = new NoticeOfIntentDecision({
      uuid: decisionUuid,
    });
    decisionServiceMock.getMany.mockResolvedValue([mockDecision]);
    noticeOfIntentServiceMock.getByFileNumber.mockResolvedValue(
      new NoticeOfIntent(),
    );

    await service.create(
      {
        ...mockModificationCreateDto,
        modifiesDecisionUuids: [decisionUuid],
      },
      {} as Board,
    );

    expect(modificationRepoMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith(
      CARD_TYPE.NOI_MODI,
      {} as Board,
      false,
    );
    expect(noticeOfIntentServiceMock.create).toBeCalledTimes(0);
    expect(decisionServiceMock.getMany).toHaveBeenCalledTimes(1);
    expect(decisionServiceMock.getMany).toHaveBeenCalledWith([decisionUuid]);
    expect(
      modificationRepoMock.save.mock.calls[0][0].modifiesDecisions,
    ).toEqual([mockDecision]);
  });

  it('should successfully update modification', async () => {
    const uuid = 'fake';

    await service.update(uuid, {
      isReviewApproved: true,
    } as NoticeOfIntentModificationUpdateDto);

    expect(modificationRepoMock.findOneBy).toBeCalledWith({
      uuid,
    });
    expect(modificationRepoMock.save).toHaveBeenCalledTimes(1);
    expect(modificationRepoMock.save).toHaveBeenCalledWith(mockModification);
  });

  it('should throw an exception when updating an modification if it does not exist', async () => {
    const uuid = 'fake';
    modificationRepoMock.findOneBy.mockResolvedValue(null);

    await expect(
      service.update(uuid, {} as NoticeOfIntentModificationUpdateDto),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Modification with uuid ${uuid} not found`),
    );
    expect(modificationRepoMock.findOneBy).toBeCalledWith({
      uuid,
    });
    expect(modificationRepoMock.save).toHaveBeenCalledTimes(0);
  });

  it('should archive the card and call softRemove on delete', async () => {
    const uuid = 'fake';
    modificationRepoMock.softRemove.mockResolvedValue({} as any);
    cardServiceMock.archive.mockResolvedValue();

    await service.delete(uuid);

    expect(modificationRepoMock.findOneBy).toBeCalledWith({
      uuid,
    });
    expect(modificationRepoMock.softRemove).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.archive).toHaveBeenCalledTimes(1);
  });

  it('should fail on delete if modification does not exist', async () => {
    const uuid = 'fake';
    modificationRepoMock.findOneBy.mockResolvedValue(null);

    await expect(service.delete(uuid)).rejects.toMatchObject(
      new ServiceNotFoundException(`Modification with uuid ${uuid} not found`),
    );
    expect(modificationRepoMock.findOneBy).toBeCalledWith({
      uuid,
    });
    expect(modificationRepoMock.softRemove).toHaveBeenCalledTimes(0);
  });

  it('should have correct filter condition in getByCardUuid', async () => {
    const cardUuid = 'fake';
    const findOptions = {
      where: { cardUuid },
      relations: DEFAULT_RELATIONS,
    };

    await service.getByCardUuid(cardUuid);

    expect(modificationRepoMock.findOneOrFail).toBeCalledWith(findOptions);
  });

  it('should have correct filter condition in getByUuid', async () => {
    const uuid = 'fake';
    const findOptions = {
      where: { uuid },
      relations: DEFAULT_RELATIONS,
    };

    await service.getByUuid(uuid);

    expect(modificationRepoMock.findOneOrFail).toBeCalledWith(findOptions);
  });

  it('should have correct filter condition in getSubtasks', async () => {
    const subtaskType = 'fake';
    const findOptions = {
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              code: subtaskType,
            },
          },
        },
      },
      relations: {
        noticeOfIntent: {
          localGovernment: true,
        },
        card: {
          status: true,
          board: true,
          type: true,
          subtasks: { type: true, assignee: true },
        },
      },
    };
    await service.getWithIncompleteSubtaskByType(subtaskType);

    expect(modificationRepoMock.find).toBeCalledWith(findOptions);
  });

  it('should load deleted cards', async () => {
    modificationRepoMock.find.mockResolvedValue([]);

    await service.getDeletedCards('file-number');

    expect(modificationRepoMock.find).toHaveBeenCalledTimes(1);
    expect(modificationRepoMock.find.mock.calls[0][0]!.withDeleted).toEqual(
      true,
    );
  });
});
