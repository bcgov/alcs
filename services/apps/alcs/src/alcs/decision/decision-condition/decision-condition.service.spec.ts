import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateApplicationDecisionConditionDto } from './decision-condition.dto';
import { ApplicationDecisionCondition } from './decision-condition.entity';
import { DecisionConditionService } from './decision-condition.service';

describe('DecisionConditionService', () => {
  let service: DecisionConditionService;
  let mockApplicationDecisionConditionRepository: DeepMocked<
    Repository<ApplicationDecisionCondition>
  >;

  beforeEach(async () => {
    mockApplicationDecisionConditionRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecisionConditionService,
        {
          provide: getRepositoryToken(ApplicationDecisionCondition),
          useValue: mockApplicationDecisionConditionRepository,
        },
      ],
    }).compile();

    service = module.get<DecisionConditionService>(DecisionConditionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repo to get one or fails with correct parameters', async () => {
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new ApplicationDecisionCondition(),
    );

    const result = await service.getOneOrFail('fake');

    expect(
      mockApplicationDecisionConditionRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionConditionRepository.findOneOrFail,
    ).toBeCalledWith({
      where: { uuid: 'fake' },
    });
    expect(result).toBeDefined();
  });

  it('calls remove method for deleted conditions', async () => {
    const conditions = [
      new ApplicationDecisionCondition(),
      new ApplicationDecisionCondition(),
    ];

    mockApplicationDecisionConditionRepository.remove.mockResolvedValue(
      {} as ApplicationDecisionCondition,
    );

    await service.remove(conditions);

    expect(
      mockApplicationDecisionConditionRepository.remove,
    ).toHaveBeenCalledWith(conditions);
  });

  it('should create new components when given a DTO without a UUID', async () => {
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new ApplicationDecisionCondition(),
    );

    const updateDtos: UpdateApplicationDecisionConditionDto[] = [{}, {}];

    const result = await service.createOrUpdate(updateDtos, [], [], false);

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(
      mockApplicationDecisionConditionRepository.findOneOrFail,
    ).toBeCalledTimes(0);
  });

  it('should update existing components when given a DTO with a UUID', async () => {
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new ApplicationDecisionCondition({
        uuid: 'uuid',
      }),
    );

    const mockDto: UpdateApplicationDecisionConditionDto = {
      uuid: 'uuid',
    };

    const result = await service.createOrUpdate([mockDto], [], [], false);

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(
      mockApplicationDecisionConditionRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionConditionRepository.findOneOrFail,
    ).toBeCalledWith({
      where: { uuid: 'uuid' },
    });
    expect(result[0].uuid).toEqual(mockDto.uuid);
  });

  it('should persist entity if persist flag is true', async () => {
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new ApplicationDecisionCondition(),
    );
    mockApplicationDecisionConditionRepository.save.mockResolvedValue(
      new ApplicationDecisionCondition(),
    );

    const updateDtos: UpdateApplicationDecisionConditionDto[] = [{}];

    const result = await service.createOrUpdate(updateDtos, [], [], true);

    expect(result).toBeDefined();
    expect(
      mockApplicationDecisionConditionRepository.findOneOrFail,
    ).toBeCalledTimes(0);
    expect(mockApplicationDecisionConditionRepository.save).toBeCalledTimes(1);
  });

  it('should not persist entity if persist flag is false', async () => {
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(
      new ApplicationDecisionCondition(),
    );
    mockApplicationDecisionConditionRepository.save.mockResolvedValue(
      new ApplicationDecisionCondition(),
    );

    const updateDtos: UpdateApplicationDecisionConditionDto[] = [{}];

    const result = await service.createOrUpdate(updateDtos, [], [], false);

    expect(result).toBeDefined();
    expect(
      mockApplicationDecisionConditionRepository.findOneOrFail,
    ).toBeCalledTimes(0);
    expect(mockApplicationDecisionConditionRepository.save).toBeCalledTimes(0);
  });
});
