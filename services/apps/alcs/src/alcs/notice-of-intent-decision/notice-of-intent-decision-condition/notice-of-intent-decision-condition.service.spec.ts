import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentDecisionConditionType } from './notice-of-intent-decision-condition-code.entity';
import { UpdateNoticeOfIntentDecisionConditionDto } from './notice-of-intent-decision-condition.dto';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionService } from './notice-of-intent-decision-condition.service';

describe('NoticeOfIntentDecisionConditionService', () => {
  let service: NoticeOfIntentDecisionConditionService;
  let mockNOIDecisionConditionRepository: DeepMocked<
    Repository<NoticeOfIntentDecisionCondition>
  >;
  let mockNOIDecisionConditionTypeRepository: DeepMocked<
    Repository<NoticeOfIntentDecisionConditionType>
  >;

  beforeEach(async () => {
    mockNOIDecisionConditionRepository = createMock();
    mockNOIDecisionConditionTypeRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentDecisionConditionService,
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionCondition),
          useValue: mockNOIDecisionConditionRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionConditionType),
          useValue: mockNOIDecisionConditionTypeRepository,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentDecisionConditionService>(
      NoticeOfIntentDecisionConditionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repo to get one or fails with correct parameters', async () => {
    mockNOIDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new NoticeOfIntentDecisionCondition(),
    );

    const result = await service.getOneOrFail('fake');

    expect(mockNOIDecisionConditionRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockNOIDecisionConditionRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'fake' },
      relations: { type: true },
    });
    expect(result).toBeDefined();
  });

  it('calls remove method for deleted conditions', async () => {
    const conditions = [
      new NoticeOfIntentDecisionCondition(),
      new NoticeOfIntentDecisionCondition(),
    ];

    mockNOIDecisionConditionRepository.remove.mockResolvedValue(
      {} as NoticeOfIntentDecisionCondition,
    );

    await service.remove(conditions);

    expect(mockNOIDecisionConditionRepository.remove).toBeCalledTimes(1);
  });

  it('should create new components when given a DTO without a UUID', async () => {
    mockNOIDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new NoticeOfIntentDecisionCondition(),
    );

    const updateDtos: UpdateNoticeOfIntentDecisionConditionDto[] = [{}, {}];

    const result = await service.createOrUpdate(updateDtos, [], [], false);

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(mockNOIDecisionConditionRepository.findOneOrFail).toBeCalledTimes(0);
  });

  it('should update existing components when given a DTO with a UUID', async () => {
    mockNOIDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new NoticeOfIntentDecisionCondition({
        uuid: 'uuid',
      }),
    );

    const mockDto: UpdateNoticeOfIntentDecisionConditionDto = {
      uuid: 'uuid',
    };

    const result = await service.createOrUpdate([mockDto], [], [], false);

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(mockNOIDecisionConditionRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockNOIDecisionConditionRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'uuid' },
      relations: { type: true },
    });
    expect(result[0].uuid).toEqual(mockDto.uuid);
  });

  it('should persist entity if persist flag is true', async () => {
    mockNOIDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new NoticeOfIntentDecisionCondition(),
    );
    mockNOIDecisionConditionRepository.save.mockResolvedValue(
      new NoticeOfIntentDecisionCondition(),
    );

    const updateDtos: UpdateNoticeOfIntentDecisionConditionDto[] = [{}];

    const result = await service.createOrUpdate(updateDtos, [], [], true);

    expect(result).toBeDefined();
    expect(mockNOIDecisionConditionRepository.findOneOrFail).toBeCalledTimes(0);
    expect(mockNOIDecisionConditionRepository.save).toBeCalledTimes(1);
  });

  it('should not persist entity if persist flag is false', async () => {
    mockNOIDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new NoticeOfIntentDecisionCondition(),
    );
    mockNOIDecisionConditionRepository.save.mockResolvedValue(
      new NoticeOfIntentDecisionCondition(),
    );

    const updateDtos: UpdateNoticeOfIntentDecisionConditionDto[] = [{}];

    const result = await service.createOrUpdate(updateDtos, [], [], false);

    expect(result).toBeDefined();
    expect(mockNOIDecisionConditionRepository.findOneOrFail).toBeCalledTimes(0);
    expect(mockNOIDecisionConditionRepository.save).toBeCalledTimes(0);
  });
});
