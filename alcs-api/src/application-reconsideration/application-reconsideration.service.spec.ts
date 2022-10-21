import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsRelations, IsNull, Repository } from 'typeorm';
import { CreateApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { CodeService } from '../code/code.service';
import { ReconsiderationProfile } from '../common/automapper/reconsideration.automapper.profile';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import {
  initApplicationMockEntity,
  initApplicationReconsiderationMockEntity,
} from '../common/utils/test-helpers/mockEntities';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationUpdateDto,
} from './application-reconsideration.dto';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationService } from './application-reconsideration.service';
import { ApplicationReconsiderationType } from './reconsideration-type/application-reconsideration-type.entity';

describe('ReconsiderationService', () => {
  let reconsiderationRepositoryMock: DeepMocked<
    Repository<ApplicationReconsideration>
  >;
  let reconsiderationTypeRepositoryMock: DeepMocked<
    Repository<ApplicationReconsiderationType>
  >;
  let service: ApplicationReconsiderationService;
  let codeServiceMock: DeepMocked<CodeService>;
  let applicationServiceMock: DeepMocked<ApplicationService>;
  let cardServiceMock: DeepMocked<CardService>;

  let mockReconsideration;

  const DEFAULT_RECONSIDERATION_RELATIONS: FindOptionsRelations<ApplicationReconsideration> =
    {
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
    };

  beforeEach(async () => {
    codeServiceMock = createMock<CodeService>();
    applicationServiceMock = createMock<ApplicationService>();
    cardServiceMock = createMock<CardService>();
    reconsiderationRepositoryMock =
      createMock<Repository<ApplicationReconsideration>>();
    reconsiderationTypeRepositoryMock =
      createMock<Repository<ApplicationReconsiderationType>>();

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
    service = module.get<ApplicationReconsiderationService>(
      ApplicationReconsiderationService,
    );

    mockReconsideration = initApplicationReconsiderationMockEntity();
    reconsiderationRepositoryMock.findOneOrFail.mockResolvedValue(
      mockReconsideration,
    );
    reconsiderationRepositoryMock.findOneByOrFail.mockResolvedValue(
      mockReconsideration,
    );
    reconsiderationRepositoryMock.find.mockResolvedValue([mockReconsideration]);
    reconsiderationTypeRepositoryMock.find.mockResolvedValue([
      mockReconsideration.type,
    ]);
    reconsiderationTypeRepositoryMock.findOneByOrFail.mockResolvedValue(
      mockReconsideration.type,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have correct filter condition in getByCode', async () => {
    const fakeBoardCode = 'fake';
    const findOptions = {
      where: { card: { board: { code: fakeBoardCode } } },
      relations: DEFAULT_RECONSIDERATION_RELATIONS,
    };

    await service.getByBoardCode(fakeBoardCode);

    expect(reconsiderationRepositoryMock.find).toBeCalledWith(findOptions);
  });

  it('should successfully create application and reconsideration card if app does not exist', async () => {
    const code = '33';
    const mockReconsiderationCreateDto = {
      reconTypeCode: code,
      applicationFileNumber: 'fake-app-number',
      applicationTypeCode: 'fake',
      regionCode: 'fake-region',
      localGovernmentUuid: 'fake-local-government-uuid',
      applicant: 'fake-applicant',
      submittedDate: 11111111111,
      boardCode: 'fake-board',
    } as ApplicationReconsiderationCreateDto;

    const mockApplicationCreateDto = {
      fileNumber: mockReconsiderationCreateDto.applicationFileNumber,
      typeCode: mockReconsiderationCreateDto.applicationTypeCode,
      regionCode: mockReconsiderationCreateDto.regionCode,
      localGovernmentUuid: mockReconsiderationCreateDto.localGovernmentUuid,
      applicant: mockReconsiderationCreateDto.applicant,
      dateReceived: mockReconsiderationCreateDto.submittedDate,
    } as CreateApplicationDto;

    reconsiderationRepositoryMock.save.mockResolvedValue({} as any);
    cardServiceMock.create.mockResolvedValue(new Card());
    applicationServiceMock.get.mockResolvedValue(undefined);
    applicationServiceMock.create.mockResolvedValue(
      mockApplicationCreateDto as any,
    );

    await service.create(mockReconsiderationCreateDto, {} as Board);

    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('RECON', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledWith(
      mockApplicationCreateDto,
      false,
    );
  });

  it('should successfully create reconsideration and link to existing application', async () => {
    const code = '33';
    const mockReconsiderationCreateDto = {
      reconTypeCode: code,
      applicationFileNumber: 'fake-app-number',
      applicationTypeCode: 'fake',
      regionCode: 'fake-region',
      localGovernmentUuid: 'fake-local-government-uuid',
      applicant: 'fake-applicant',
      submittedDate: 11111111111,
      boardCode: 'fake-board',
    } as ApplicationReconsiderationCreateDto;
    cardServiceMock.create.mockResolvedValue(new Card());
    applicationServiceMock.get.mockResolvedValue(
      initApplicationMockEntity(
        mockReconsiderationCreateDto.applicationFileNumber,
      ),
    );
    reconsiderationRepositoryMock.save.mockResolvedValue({} as any);

    await service.create(mockReconsiderationCreateDto, {} as Board);

    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('RECON', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledTimes(0);
  });

  it('should successfully update reconsideration', async () => {
    const uuid = 'fake';
    const code = '33';

    reconsiderationRepositoryMock.save.mockResolvedValue({} as any);

    await service.update(uuid, {
      typeCode: code,
      isReviewApproved: true,
    } as ApplicationReconsiderationUpdateDto);

    expect(reconsiderationRepositoryMock.findOneByOrFail).toBeCalledWith({
      uuid,
    });
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledWith(
      mockReconsideration,
    );
  });

  it('should fail update reconsideration if it does not exist', async () => {
    const uuid = 'fake';
    reconsiderationRepositoryMock.findOneByOrFail.mockReturnValue(undefined);

    await expect(
      service.update(uuid, {} as ApplicationReconsiderationUpdateDto),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Reconsideration with uuid ${uuid} not found`,
      ),
    );
    expect(reconsiderationRepositoryMock.findOneByOrFail).toBeCalledWith({
      uuid,
    });
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(0);
  });

  it('should set reviewDate and isReviewApproved to null if reconsideration type is updated to 33.1', async () => {
    reconsiderationRepositoryMock.save.mockResolvedValue({} as any);

    const uuid = 'fake';
    const code = '33.1';

    reconsiderationTypeRepositoryMock.findOneByOrFail.mockResolvedValue({
      code: code,
      label: 'fake-label',
    } as ApplicationReconsiderationType);

    await service.update(uuid, {
      typeCode: code,
    });

    expect(reconsiderationRepositoryMock.findOneByOrFail).toBeCalledWith({
      uuid,
    });
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledWith({
      ...mockReconsideration,
      reviewDate: null,
      isReviewApproved: null,
    } as ApplicationReconsideration);
  });

  it('should call softRemove on delete', async () => {
    const uuid = 'fake';
    reconsiderationRepositoryMock.softRemove.mockResolvedValue({} as any);

    await service.delete(uuid);

    expect(reconsiderationRepositoryMock.findOneByOrFail).toBeCalledWith({
      uuid,
    });
    expect(reconsiderationRepositoryMock.softRemove).toHaveBeenCalledTimes(1);
  });

  it('should fail on delete if reconsideration does not exist', async () => {
    const uuid = 'fake';
    reconsiderationRepositoryMock.findOneByOrFail.mockReturnValue(undefined);

    await expect(service.delete(uuid)).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Reconsideration with uuid ${uuid} not found`,
      ),
    );
    expect(reconsiderationRepositoryMock.findOneByOrFail).toBeCalledWith({
      uuid,
    });
    expect(reconsiderationRepositoryMock.softRemove).toHaveBeenCalledTimes(0);
  });

  it('should have correct filter condition in getByCardUuid', async () => {
    const cardUuid = 'fake';
    const findOptions = {
      where: { cardUuid },
      relations: DEFAULT_RECONSIDERATION_RELATIONS,
    };

    await service.getByCardUuid(cardUuid);

    expect(reconsiderationRepositoryMock.findOneOrFail).toBeCalledWith(
      findOptions,
    );
  });

  it('should have correct filter condition in getByUuid', async () => {
    const uuid = 'fake';
    const findOptions = {
      where: { uuid },
      relations: DEFAULT_RECONSIDERATION_RELATIONS,
    };

    await service.getByUuid(uuid);

    expect(reconsiderationRepositoryMock.findOneOrFail).toBeCalledWith(
      findOptions,
    );
  });

  it('should have correct filter condition in getSubtasks', async () => {
    const subtaskType = 'fake';
    const findOptions = {
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              type: subtaskType,
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
});
