import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { FindOptionsRelations, IsNull, Repository } from 'typeorm';
import {
  initApplicationMockEntity,
  initApplicationModificationMockEntity,
} from '../../../../test/mocks/mockEntities';
import { ModificationProfile } from '../../../common/automapper/modification.automapper.profile';
import { CreateApplicationDto } from '../../application/application.dto';
import { ApplicationService } from '../../application/application.service';
import { Board } from '../../board/board.entity';
import { Card } from '../../card/card.entity';
import { CardService } from '../../card/card.service';
import { ApplicationDecisionV2Service } from '../application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecision } from '../application-decision.entity';
import {
  ApplicationModificationCreateDto,
  ApplicationModificationUpdateDto,
} from './application-modification.dto';
import { ApplicationModification } from './application-modification.entity';
import { ApplicationModificationService } from './application-modification.service';

describe('ApplicationModificationService', () => {
  let modificationRepoMock: DeepMocked<Repository<ApplicationModification>>;
  let service: ApplicationModificationService;
  let applicationServiceMock: DeepMocked<ApplicationService>;
  let cardServiceMock: DeepMocked<CardService>;
  let decisionServiceMock: DeepMocked<ApplicationDecisionV2Service>;

  let mockModification;
  let mockModificationCreateDto;

  const BOARD_RELATIONS: FindOptionsRelations<ApplicationModification> = {
    application: {
      type: true,
      region: true,
      localGovernment: true,
      decisionMeetings: true,
    },
    card: {
      board: false,
      type: true,
      status: true,
      assignee: true,
    },
  };

  const DEFAULT_RELATIONS: FindOptionsRelations<ApplicationModification> = {
    modifiesDecisions: true,
    application: {
      type: true,
      region: true,
      localGovernment: true,
      decisionMeetings: true,
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
    applicationServiceMock = createMock();
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
        ApplicationModificationService,
        {
          provide: ApplicationService,
          useValue: applicationServiceMock,
        },
        {
          provide: CardService,
          useValue: cardServiceMock,
        },
        {
          provide: ApplicationDecisionV2Service,
          useValue: decisionServiceMock,
        },
        {
          provide: getRepositoryToken(ApplicationModification),
          useValue: modificationRepoMock,
        },
        ModificationProfile,
      ],
    }).compile();
    service = module.get<ApplicationModificationService>(
      ApplicationModificationService,
    );

    mockModification = initApplicationModificationMockEntity();
    modificationRepoMock.findOneOrFail.mockResolvedValue(mockModification);
    modificationRepoMock.findOneBy.mockResolvedValue(mockModification);
    modificationRepoMock.find.mockResolvedValue([mockModification]);

    mockModificationCreateDto = {
      applicationFileNumber: 'fake-app-number',
      applicationTypeCode: 'fake',
      regionCode: 'fake-region',
      localGovernmentUuid: 'fake-local-government-uuid',
      applicant: 'fake-applicant',
      submittedDate: 11111111111,
      boardCode: 'fake-board',
      isTimeExtension: false,
    } as ApplicationModificationCreateDto;

    mockModification = initApplicationModificationMockEntity();
    modificationRepoMock.findOneOrFail.mockResolvedValue(mockModification);
    modificationRepoMock.findOneBy.mockResolvedValue(mockModification);
    modificationRepoMock.find.mockResolvedValue([mockModification]);
    modificationRepoMock.save.mockResolvedValue({} as any);

    cardServiceMock.create.mockResolvedValue(new Card());

    decisionServiceMock.getMany.mockResolvedValue([]);

    applicationServiceMock.get.mockResolvedValue(
      initApplicationMockEntity(
        mockModificationCreateDto.applicationFileNumber,
      ),
    );
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

  it('should successfully create application and modification card if app does not exist', async () => {
    const mockApplicationCreateDto = {
      fileNumber: mockModificationCreateDto.applicationFileNumber,
      typeCode: mockModificationCreateDto.applicationTypeCode,
      regionCode: mockModificationCreateDto.regionCode,
      localGovernmentUuid: mockModificationCreateDto.localGovernmentUuid,
      applicant: mockModificationCreateDto.applicant,
    } as CreateApplicationDto;

    applicationServiceMock.get.mockResolvedValue(null);
    applicationServiceMock.create.mockResolvedValue(
      mockApplicationCreateDto as any,
    );

    await service.create(mockModificationCreateDto, {} as Board);

    expect(modificationRepoMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('MODI', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledWith(
      mockApplicationCreateDto,
      false,
    );
  });

  it('should successfully create modification and link to existing application', async () => {
    await service.create(mockModificationCreateDto, {} as Board);

    expect(modificationRepoMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('MODI', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledTimes(0);
  });

  it('should successfully create modification and link to decisions', async () => {
    const decisionUuid = 'decision-uuid';

    const mockDecision = {
      uuid: decisionUuid,
    };
    decisionServiceMock.getMany.mockResolvedValue([
      mockDecision as ApplicationDecision,
    ]);

    await service.create(
      {
        ...mockModificationCreateDto,
        modifiesDecisionUuids: [decisionUuid],
      },
      {} as Board,
    );

    expect(modificationRepoMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('MODI', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledTimes(0);
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
    } as ApplicationModificationUpdateDto);

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
      service.update(uuid, {} as ApplicationModificationUpdateDto),
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

    expect(modificationRepoMock.findOneBy).toHaveBeenCalledWith({
      uuid,
    });
    expect(modificationRepoMock.softRemove).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.archive).toHaveBeenCalledTimes(1);
  });

  it('should not call archive card if modification does not have card attached (only modifications imported from OATS) on delete', async () => {
    const uuid = 'fake';
    modificationRepoMock.findOneBy.mockResolvedValue(
      new ApplicationModification(),
    );
    modificationRepoMock.softRemove.mockResolvedValue({} as any);
    cardServiceMock.archive.mockResolvedValue();

    await service.delete(uuid);

    expect(modificationRepoMock.findOneBy).toHaveBeenCalledWith({
      uuid,
    });
    expect(modificationRepoMock.softRemove).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.archive).toHaveBeenCalledTimes(0);
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
        application: {
          type: true,
          decisionMeetings: true,
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
