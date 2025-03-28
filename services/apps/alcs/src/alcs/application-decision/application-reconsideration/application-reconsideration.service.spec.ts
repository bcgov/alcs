import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { FindOptionsRelations, IsNull, Repository } from 'typeorm';
import {
  initApplicationMockEntity,
  initApplicationReconsiderationMockEntity,
} from '../../../../test/mocks/mockEntities';
import { ReconsiderationProfile } from '../../../common/automapper/reconsideration.automapper.profile';
import { CreateApplicationServiceDto } from '../../application/application.dto';
import { ApplicationService } from '../../application/application.service';
import { Board } from '../../board/board.entity';
import { Card } from '../../card/card.entity';
import { CardService } from '../../card/card.service';
import { CodeService } from '../../code/code.service';
import { ApplicationDecisionV2Service } from '../application-decision-v2/application-decision/application-decision-v2.service';
import { ApplicationDecision } from '../application-decision.entity';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationUpdateDto,
} from './application-reconsideration.dto';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationService } from './application-reconsideration.service';
import { ApplicationReconsiderationType } from './reconsideration-type/application-reconsideration-type.entity';

describe('ReconsiderationService', () => {
  let reconsiderationRepositoryMock: DeepMocked<Repository<ApplicationReconsideration>>;
  let reconsiderationTypeRepositoryMock: DeepMocked<Repository<ApplicationReconsiderationType>>;
  let service: ApplicationReconsiderationService;
  let codeServiceMock: DeepMocked<CodeService>;
  let applicationServiceMock: DeepMocked<ApplicationService>;
  let cardServiceMock: DeepMocked<CardService>;
  let decisionServiceMock: DeepMocked<ApplicationDecisionV2Service>;

  let mockReconsideration;
  let mockReconsiderationCreateDto;

  const DEFAULT_BOARD_RELATIONS: FindOptionsRelations<ApplicationReconsideration> = {
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
    type: true,
  };

  const DEFAULT_RECONSIDERATION_RELATIONS: FindOptionsRelations<ApplicationReconsideration> = {
    reconsidersDecisions: true,
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
    type: true,
    resultingDecision: true,
    reviewOutcome: true,
    decisionOutcome: true,
  };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));
    codeServiceMock = createMock();
    applicationServiceMock = createMock();
    cardServiceMock = createMock();
    reconsiderationRepositoryMock = createMock();
    reconsiderationTypeRepositoryMock = createMock();
    decisionServiceMock = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationReconsiderationService,
        {
          provide: CodeService,
          useValue: codeServiceMock,
        },
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
          provide: getRepositoryToken(ApplicationReconsideration),
          useValue: reconsiderationRepositoryMock,
        },
        {
          provide: getRepositoryToken(ApplicationReconsiderationType),
          useValue: reconsiderationTypeRepositoryMock,
        },
        ReconsiderationProfile,
      ],
    }).compile();

    mockReconsiderationCreateDto = {
      reconTypeCode: '33',
      applicationFileNumber: 'fake-app-number',
      applicationTypeCode: 'fake',
      regionCode: 'fake-region',
      localGovernmentUuid: 'fake-local-government-uuid',
      applicant: 'fake-applicant',
      submittedDate: 11111111111,
      boardCode: 'fake-board',
    } as ApplicationReconsiderationCreateDto;

    service = module.get<ApplicationReconsiderationService>(ApplicationReconsiderationService);

    mockReconsideration = initApplicationReconsiderationMockEntity();
    reconsiderationRepositoryMock.findOneOrFail.mockResolvedValue(mockReconsideration);
    reconsiderationRepositoryMock.findOne.mockResolvedValue(mockReconsideration);
    reconsiderationRepositoryMock.find.mockResolvedValue([mockReconsideration]);
    reconsiderationTypeRepositoryMock.find.mockResolvedValue([mockReconsideration.type]);
    reconsiderationTypeRepositoryMock.findOneByOrFail.mockResolvedValue(mockReconsideration.type);
    reconsiderationRepositoryMock.save.mockResolvedValue({} as any);

    applicationServiceMock.get.mockResolvedValue(
      initApplicationMockEntity(mockReconsiderationCreateDto.applicationFileNumber),
    );

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
      relations: DEFAULT_BOARD_RELATIONS,
    };

    await service.getByBoard(fakeBoardUuid);

    expect(reconsiderationRepositoryMock.find).toBeCalledWith(findOptions);
  });

  it('should successfully create application and reconsideration card if app does not exist', async () => {
    const mockApplicationCreateDto = {
      fileNumber: mockReconsiderationCreateDto.applicationFileNumber,
      typeCode: mockReconsiderationCreateDto.applicationTypeCode,
      regionCode: mockReconsiderationCreateDto.regionCode,
      localGovernmentUuid: mockReconsiderationCreateDto.localGovernmentUuid,
      applicant: mockReconsiderationCreateDto.applicant,
    } as CreateApplicationServiceDto;

    applicationServiceMock.get.mockResolvedValue(null);
    applicationServiceMock.create.mockResolvedValue(mockApplicationCreateDto as any);

    await service.create(mockReconsiderationCreateDto, {} as Board);

    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('RECON', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledWith(mockApplicationCreateDto, false);
  });

  it('should successfully create reconsideration and link to existing application', async () => {
    await service.create(mockReconsiderationCreateDto, {} as Board);

    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('RECON', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledTimes(0);
  });

  it('should successfully create reconsideration and link to decisions', async () => {
    const decisionUuid = 'decision-uuid';

    const mockDecision = {
      uuid: decisionUuid,
    };
    decisionServiceMock.getMany.mockResolvedValue([mockDecision as ApplicationDecision]);

    await service.create(
      {
        ...mockReconsiderationCreateDto,
        reconsideredDecisionUuids: [decisionUuid],
      },
      {} as Board,
    );

    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('RECON', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledTimes(0);
    expect(decisionServiceMock.getMany).toHaveBeenCalledTimes(1);
    expect(decisionServiceMock.getMany).toHaveBeenCalledWith([decisionUuid]);
    expect(reconsiderationRepositoryMock.save.mock.calls[0][0].reconsidersDecisions).toEqual([mockDecision]);
  });

  it('should successfully update reconsideration', async () => {
    const uuid = 'fake';
    const code = '33';

    await service.update(uuid, {
      typeCode: code,
      isReviewApproved: true,
    } as ApplicationReconsiderationUpdateDto);

    expect(reconsiderationRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledWith(mockReconsideration);
  });

  it('should fail update reconsideration if it does not exist', async () => {
    const uuid = 'fake';
    reconsiderationRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.update(uuid, {} as ApplicationReconsiderationUpdateDto)).rejects.toMatchObject(
      new ServiceNotFoundException(`Reconsideration with uuid ${uuid} not found`),
    );
    expect(reconsiderationRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(0);
  });

  it('should set reviewDate and isReviewApproved to null if reconsideration type is updated to 33.1', async () => {
    const uuid = 'fake';
    const code = '33.1';

    reconsiderationTypeRepositoryMock.findOneByOrFail.mockResolvedValue({
      code: code,
      label: 'fake-label',
    } as ApplicationReconsiderationType);

    await service.update(uuid, {
      typeCode: code,
    });

    expect(reconsiderationRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledWith({
      ...mockReconsideration,
      reviewDate: null,
      reviewOutcomeCode: null,
    } as ApplicationReconsideration);
  });

  it('should archive the card and call softRemove on delete', async () => {
    const uuid = 'fake';
    reconsiderationRepositoryMock.softRemove.mockResolvedValue({} as any);
    cardServiceMock.archive.mockResolvedValue();

    await service.delete(uuid);

    expect(reconsiderationRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(reconsiderationRepositoryMock.softRemove).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.archive).toHaveBeenCalledTimes(1);
  });

  it('should not call archive card if reconsideration does not have card attached (only reconsiderations imported from OATS) on delete', async () => {
    const uuid = 'fake';
    reconsiderationRepositoryMock.findOne.mockResolvedValue(new ApplicationReconsideration());
    reconsiderationRepositoryMock.softRemove.mockResolvedValue({} as any);
    cardServiceMock.archive.mockResolvedValue();

    await service.delete(uuid);

    expect(reconsiderationRepositoryMock.findOne).toHaveBeenCalledWith({
      relations: {
        type: true,
        resultingDecision: true,
      },
      where: {
        uuid,
      },
    });
    expect(reconsiderationRepositoryMock.softRemove).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.archive).toHaveBeenCalledTimes(0);
  });

  it('should fail on delete if reconsideration does not exist', async () => {
    const uuid = 'fake';
    reconsiderationRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.delete(uuid)).rejects.toMatchObject(
      new ServiceNotFoundException(`Reconsideration with uuid ${uuid} not found`),
    );

    expect(reconsiderationRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(reconsiderationRepositoryMock.softRemove).toHaveBeenCalledTimes(0);
  });

  it('should have correct filter condition in getByCardUuid', async () => {
    const cardUuid = 'fake';
    const findOptions = {
      where: { cardUuid },
      relations: DEFAULT_RECONSIDERATION_RELATIONS,
    };

    await service.getByCardUuid(cardUuid);

    expect(reconsiderationRepositoryMock.findOneOrFail).toBeCalledWith(findOptions);
  });

  it('should have correct filter condition in getByUuid', async () => {
    const uuid = 'fake';
    const findOptions = {
      where: { uuid },
      relations: DEFAULT_RECONSIDERATION_RELATIONS,
    };

    await service.getByUuid(uuid);

    expect(reconsiderationRepositoryMock.findOneOrFail).toBeCalledWith(findOptions);
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

    expect(reconsiderationRepositoryMock.find).toBeCalledWith(findOptions);
  });

  it('should load deleted cards', async () => {
    reconsiderationRepositoryMock.find.mockResolvedValue([]);

    await service.getDeletedCards('file-number');

    expect(reconsiderationRepositoryMock.find).toHaveBeenCalledTimes(1);
    expect(reconsiderationRepositoryMock.find.mock.calls[0][0]!.withDeleted).toEqual(true);
  });

  it('should throw ServiceValidationException when deleting a reconsideration with a resulting decision', async () => {
    const uuid = 'fake';
    const mockReconWithDecision = {
      ...mockReconsideration,
      uuid: uuid,
      resultingDecision: { uuid: 'decision-uuid' },
    };

    reconsiderationRepositoryMock.findOne.mockResolvedValue(mockReconWithDecision);

    await expect(service.delete(uuid)).rejects.toThrow(
      `Cannot delete reconsideration ${uuid} that has a resulting decision`,
    );

    expect(reconsiderationRepositoryMock.findOne).toHaveBeenCalledWith({
      relations: {
        type: true,
        resultingDecision: true,
      },
      where: {
        uuid,
      },
    });
    expect(reconsiderationRepositoryMock.softRemove).toHaveBeenCalledTimes(0);
    expect(cardServiceMock.archive).toHaveBeenCalledTimes(0);
  });
});
