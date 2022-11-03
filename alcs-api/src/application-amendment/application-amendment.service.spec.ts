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
import { AmendmentProfile } from '../common/automapper/amendment.automapper.profile';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import {
  initApplicationAmendementMockEntity,
  initApplicationMockEntity,
} from '../common/utils/test-helpers/mockEntities';
import {
  ApplicationAmendmentCreateDto,
  ApplicationAmendmentUpdateDto,
} from './application-amendment.dto';
import { ApplicationAmendment } from './application-amendment.entity';
import { ApplicationAmendmentService } from './application-amendment.service';

describe('AmendmentService', () => {
  let amendmentRepoMock: DeepMocked<Repository<ApplicationAmendment>>;
  let service: ApplicationAmendmentService;
  let applicationServiceMock: DeepMocked<ApplicationService>;
  let cardServiceMock: DeepMocked<CardService>;

  let mockAmendment;
  let mockAmendmentCreateDto;

  const DEFAULT_RELATIONS: FindOptionsRelations<ApplicationAmendment> = {
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
  };

  beforeEach(async () => {
    applicationServiceMock = createMock<ApplicationService>();
    cardServiceMock = createMock<CardService>();
    amendmentRepoMock = createMock<Repository<ApplicationAmendment>>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationAmendmentService,
        {
          provide: ApplicationService,
          useValue: applicationServiceMock,
        },
        {
          provide: CardService,
          useValue: cardServiceMock,
        },
        {
          provide: getRepositoryToken(ApplicationAmendment),
          useValue: amendmentRepoMock,
        },
        AmendmentProfile,
      ],
    }).compile();
    service = module.get<ApplicationAmendmentService>(
      ApplicationAmendmentService,
    );

    mockAmendment = initApplicationAmendementMockEntity();
    amendmentRepoMock.findOneOrFail.mockResolvedValue(mockAmendment);
    amendmentRepoMock.findOneBy.mockResolvedValue(mockAmendment);
    amendmentRepoMock.find.mockResolvedValue([mockAmendment]);

    mockAmendmentCreateDto = {
      applicationFileNumber: 'fake-app-number',
      applicationTypeCode: 'fake',
      regionCode: 'fake-region',
      localGovernmentUuid: 'fake-local-government-uuid',
      applicant: 'fake-applicant',
      submittedDate: 11111111111,
      boardCode: 'fake-board',
      isTimeExtension: false,
    } as ApplicationAmendmentCreateDto;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have correct filter condition in getByCode', async () => {
    const fakeBoardCode = 'fake';
    const findOptions = {
      where: { card: { board: { code: fakeBoardCode } } },
      relations: DEFAULT_RELATIONS,
    };

    await service.getByBoardCode(fakeBoardCode);

    expect(amendmentRepoMock.find).toBeCalledWith(findOptions);
  });

  it('should successfully create application and amendment card if app does not exist', async () => {
    const mockApplicationCreateDto = {
      fileNumber: mockAmendmentCreateDto.applicationFileNumber,
      typeCode: mockAmendmentCreateDto.applicationTypeCode,
      regionCode: mockAmendmentCreateDto.regionCode,
      localGovernmentUuid: mockAmendmentCreateDto.localGovernmentUuid,
      applicant: mockAmendmentCreateDto.applicant,
    } as CreateApplicationDto;

    amendmentRepoMock.save.mockResolvedValue({} as any);
    cardServiceMock.create.mockResolvedValue(new Card());
    applicationServiceMock.get.mockResolvedValue(undefined);
    applicationServiceMock.create.mockResolvedValue(
      mockApplicationCreateDto as any,
    );

    await service.create(mockAmendmentCreateDto, {} as Board);

    expect(amendmentRepoMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('AMEND', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledWith(
      mockApplicationCreateDto,
      false,
    );
  });

  it('should successfully create amendment and link to existing application', async () => {
    cardServiceMock.create.mockResolvedValue(new Card());
    applicationServiceMock.get.mockResolvedValue(
      initApplicationMockEntity(mockAmendmentCreateDto.applicationFileNumber),
    );
    amendmentRepoMock.save.mockResolvedValue({} as any);

    await service.create(mockAmendmentCreateDto, {} as Board);

    expect(amendmentRepoMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith('AMEND', {} as Board, false);
    expect(applicationServiceMock.create).toBeCalledTimes(0);
  });

  it('should successfully update amendment', async () => {
    const uuid = 'fake';

    amendmentRepoMock.save.mockResolvedValue({} as any);

    await service.update(uuid, {
      isReviewApproved: true,
    } as ApplicationAmendmentUpdateDto);

    expect(amendmentRepoMock.findOneBy).toBeCalledWith({
      uuid,
    });
    expect(amendmentRepoMock.save).toHaveBeenCalledTimes(1);
    expect(amendmentRepoMock.save).toHaveBeenCalledWith(mockAmendment);
  });

  it('should throw an exception when updating an amendment if it does not exist', async () => {
    const uuid = 'fake';
    amendmentRepoMock.findOneBy.mockReturnValue(undefined);

    await expect(
      service.update(uuid, {} as ApplicationAmendmentUpdateDto),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(`Amendment with uuid ${uuid} not found`),
    );
    expect(amendmentRepoMock.findOneBy).toBeCalledWith({
      uuid,
    });
    expect(amendmentRepoMock.save).toHaveBeenCalledTimes(0);
  });

  it('should call softRemove on delete', async () => {
    const uuid = 'fake';
    amendmentRepoMock.softRemove.mockResolvedValue({} as any);

    await service.delete(uuid);

    expect(amendmentRepoMock.findOneBy).toBeCalledWith({
      uuid,
    });
    expect(amendmentRepoMock.softRemove).toHaveBeenCalledTimes(1);
  });

  it('should fail on delete if amendment does not exist', async () => {
    const uuid = 'fake';
    amendmentRepoMock.findOneBy.mockReturnValue(undefined);

    await expect(service.delete(uuid)).rejects.toMatchObject(
      new ServiceNotFoundException(`Amendment with uuid ${uuid} not found`),
    );
    expect(amendmentRepoMock.findOneBy).toBeCalledWith({
      uuid,
    });
    expect(amendmentRepoMock.softRemove).toHaveBeenCalledTimes(0);
  });

  it('should have correct filter condition in getByCardUuid', async () => {
    const cardUuid = 'fake';
    const findOptions = {
      where: { cardUuid },
      relations: DEFAULT_RELATIONS,
    };

    await service.getByCardUuid(cardUuid);

    expect(amendmentRepoMock.findOneOrFail).toBeCalledWith(findOptions);
  });

  it('should have correct filter condition in getByUuid', async () => {
    const uuid = 'fake';
    const findOptions = {
      where: { uuid },
      relations: DEFAULT_RELATIONS,
    };

    await service.getByUuid(uuid);

    expect(amendmentRepoMock.findOneOrFail).toBeCalledWith(findOptions);
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

    expect(amendmentRepoMock.find).toBeCalledWith(findOptions);
  });
});
