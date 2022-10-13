import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Board } from '../../board/board.entity';
import { CardCreateDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';
import { CardService } from '../../card/card.service';
import { CodeService } from '../../code/code.service';
import { ReconsiderationProfile } from '../../common/automapper/reconsideration.automapper.profile';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import {
  initApplicationMockEntity,
  initApplicationReconsiderationMockEntity,
} from '../../common/utils/test-helpers/mockEntities';
import {
  MockType,
  repositoryMockFactory,
} from '../../common/utils/test-helpers/mockTypes';
import { CreateApplicationDto } from '../application.dto';
import { ApplicationService } from '../application.service';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationService } from './application-reconsideration.service';
import {
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationUpdateDto,
} from './applicationReconsideration.dto';
import { ApplicationReconsiderationType } from './reconsideration-type/application-reconsideration-type.entity';

describe('ReconsiderationService', () => {
  let reconsiderationRepositoryMock: MockType<
    Repository<ApplicationReconsideration>
  >;
  let service: ApplicationReconsiderationService;
  let codeServiceMock: DeepMocked<CodeService>;
  let applicationServiceMock: DeepMocked<ApplicationService>;
  let cardServiceMock: DeepMocked<CardService>;

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
          useFactory: repositoryMockFactory,
        },
        ReconsiderationProfile,
      ],
    }).compile();

    reconsiderationRepositoryMock = module.get(
      getRepositoryToken(ApplicationReconsideration),
    );
    service = module.get<ApplicationReconsiderationService>(
      ApplicationReconsiderationService,
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
    const mockReconsideration = initApplicationReconsiderationMockEntity();
    const mockReconsiderationCreateDto = {
      reconTypeCode: code,
      applicationFileNumber: 'fake-app-number',
      applicationTypeCode: 'fake',
      region: 'fake-region',
      localGovernmentUuid: 'fake-local-government-uuid',
      applicant: 'fake-applicant',
      submittedDate: 11111111111,
      boardCode: 'fake-board',
    } as ApplicationReconsiderationCreateDto;

    const mockApplicationCreateDto = {
      fileNumber: mockReconsiderationCreateDto.applicationFileNumber,
      type: mockReconsiderationCreateDto.applicationTypeCode,
      region: mockReconsiderationCreateDto.region,
      localGovernmentUuid: mockReconsiderationCreateDto.localGovernmentUuid,
      applicant: mockReconsiderationCreateDto.applicant,
      dateReceived: mockReconsiderationCreateDto.submittedDate,
    } as CreateApplicationDto;

    codeServiceMock.fetchReconsiderationType.mockResolvedValue(
      mockReconsideration.type,
    );
    cardServiceMock.create.mockResolvedValue(new Card());
    applicationServiceMock.get.mockResolvedValue(undefined);
    applicationServiceMock.create.mockResolvedValue(
      mockApplicationCreateDto as any,
    );

    await service.create(mockReconsiderationCreateDto, {} as Board);
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith(
      {
        boardCode: mockReconsiderationCreateDto.boardCode,
        typeCode: 'RECON',
      } as CardCreateDto,
      {} as Board,
      false,
    );
    expect(applicationServiceMock.create).toBeCalledWith(
      mockApplicationCreateDto,
      false,
    );
  });

  it('should successfully create reconsideration and link to existing application', async () => {
    const code = '33';
    const mockReconsideration = initApplicationReconsiderationMockEntity();
    const mockReconsiderationCreateDto = {
      reconTypeCode: code,
      applicationFileNumber: 'fake-app-number',
      applicationTypeCode: 'fake',
      region: 'fake-region',
      localGovernmentUuid: 'fake-local-government-uuid',
      applicant: 'fake-applicant',
      submittedDate: 11111111111,
      boardCode: 'fake-board',
    } as ApplicationReconsiderationCreateDto;

    codeServiceMock.fetchReconsiderationType.mockResolvedValue(
      mockReconsideration.type,
    );
    cardServiceMock.create.mockResolvedValue(new Card());
    applicationServiceMock.get.mockResolvedValue(
      initApplicationMockEntity(
        mockReconsiderationCreateDto.applicationFileNumber,
      ),
    );

    await service.create(mockReconsiderationCreateDto, {} as Board);
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(cardServiceMock.create).toBeCalledWith(
      {
        boardCode: mockReconsiderationCreateDto.boardCode,
        typeCode: 'RECON',
      } as CardCreateDto,
      {} as Board,
      false,
    );
    expect(applicationServiceMock.create).toBeCalledTimes(0);
  });

  it('should fail create reconsideration if reconsideration type is invalid', async () => {
    const code = 'fake-code';
    reconsiderationRepositoryMock.findOneByOrFail.mockReturnValue(
      initApplicationReconsiderationMockEntity(),
    );
    codeServiceMock.fetchReconsiderationType.mockResolvedValue(undefined);

    await expect(
      service.create(
        {
          reconTypeCode: code,
        } as ApplicationReconsiderationCreateDto,
        {} as Board,
      ),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Provided reconsideration type does not exist ${code}`,
      ),
    );
    expect(cardServiceMock.create).toBeCalledTimes(0);
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(0);
  });

  it('should successfully update reconsideration', async () => {
    const uuid = 'fake';
    const code = '33';
    const mockReconsideration = initApplicationReconsiderationMockEntity();
    reconsiderationRepositoryMock.findOneByOrFail.mockReturnValue(
      mockReconsideration,
    );
    codeServiceMock.fetchReconsiderationType.mockResolvedValue(
      mockReconsideration.type,
    );

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

  it('should fail update reconsideration if reconsideration type is invalid', async () => {
    const uuid = 'fake';
    const code = 'fake-code';
    reconsiderationRepositoryMock.findOneByOrFail.mockReturnValue(
      initApplicationReconsiderationMockEntity(),
    );
    codeServiceMock.fetchReconsiderationType.mockResolvedValue(undefined);

    await expect(
      service.update(uuid, {
        typeCode: code,
      } as ApplicationReconsiderationUpdateDto),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Provided reconsideration type does not exist ${code}`,
      ),
    );
    expect(reconsiderationRepositoryMock.findOneByOrFail).toBeCalledWith({
      uuid,
    });
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(0);
  });

  it('should fail update reconsideration if review outcome is invalid', async () => {
    const uuid = 'fake';
    const code = '33';
    reconsiderationRepositoryMock.findOneByOrFail.mockReturnValue(
      initApplicationReconsiderationMockEntity(),
    );
    codeServiceMock.fetchReconsiderationType.mockResolvedValue(
      {} as ApplicationReconsiderationType,
    );

    await expect(
      service.update(uuid, {
        typeCode: code,
        isReviewApproved: null,
      } as ApplicationReconsiderationUpdateDto),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        'Review outcome is required for reconsideration of type 33',
      ),
    );
    expect(reconsiderationRepositoryMock.findOneByOrFail).toBeCalledWith({
      uuid,
    });
    expect(reconsiderationRepositoryMock.save).toHaveBeenCalledTimes(0);
  });

  it('should call softRemove on delete', async () => {
    const uuid = 'fake';
    reconsiderationRepositoryMock.findOneByOrFail.mockReturnValue(
      initApplicationReconsiderationMockEntity(),
    );

    await service.delete('fake');

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
});
