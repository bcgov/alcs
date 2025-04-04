import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionConditionToComponentLot } from '../application-condition-to-component-lot/application-decision-condition-to-component-lot.entity';
import { ApplicationDecisionConditionComponentPlanNumber } from '../application-decision-component-to-condition/application-decision-component-to-condition-plan-number.entity';
import { ApplicationDecisionConditionType } from './application-decision-condition-code.entity';
import { UpdateApplicationDecisionConditionDto } from './application-decision-condition.dto';
import { ApplicationDecisionCondition } from './application-decision-condition.entity';
import { ApplicationDecisionConditionService } from './application-decision-condition.service';
import { Mapper } from 'automapper-core';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { ApplicationDecisionConditionDate } from './application-decision-condition-date/application-decision-condition-date.entity';
import { ApplicationTimeTrackingService } from '../../application/application-time-tracking.service';
import { ApplicationPaused } from '../../application/application-paused.entity';
import { ApplicationModification } from '../application-modification/application-modification.entity';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';

describe('ApplicationDecisionConditionService', () => {
  let service: ApplicationDecisionConditionService;
  let timeTrackingService: ApplicationTimeTrackingService;
  let mockApplicationDecisionConditionRepository: DeepMocked<Repository<ApplicationDecisionCondition>>;
  let mockAppDecCondTypeRepository: DeepMocked<Repository<ApplicationDecisionConditionType>>;
  let mockApplicationModificationRepository: DeepMocked<Repository<ApplicationModification>>;
  let mockApplicationReconsiderationRepository: DeepMocked<Repository<ApplicationReconsideration>>;
  
  let mockApplicationDecisionConditionComponentPlanNumber: DeepMocked<
    Repository<ApplicationDecisionConditionComponentPlanNumber>
  >;
  let mockApplicationDecisionConditionToComponentLot: DeepMocked<
    Repository<ApplicationDecisionConditionToComponentLot>
  >;
  let mockApplicationPausedRepository: DeepMocked<Repository<ApplicationPaused>>;
  let mockMapper: DeepMocked<Mapper>;
  let mockApplicationDecisionConditionDate: DeepMocked<Repository<ApplicationDecisionConditionDate>>;

  beforeEach(async () => {
    mockApplicationDecisionConditionRepository = createMock();
    mockAppDecCondTypeRepository = createMock();
    mockApplicationDecisionConditionComponentPlanNumber = createMock();
    mockApplicationDecisionConditionToComponentLot = createMock();
    mockMapper = createMock();
    mockApplicationDecisionConditionDate = createMock();
    mockApplicationPausedRepository = createMock();
    mockApplicationModificationRepository = createMock();
    mockApplicationReconsiderationRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationDecisionConditionService,
        ApplicationTimeTrackingService,
        {
          provide: getRepositoryToken(ApplicationDecisionCondition),
          useValue: mockApplicationDecisionConditionRepository,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionConditionType),
          useValue: mockAppDecCondTypeRepository,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionConditionComponentPlanNumber),
          useValue: mockApplicationDecisionConditionComponentPlanNumber,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionConditionToComponentLot),
          useValue: mockApplicationDecisionConditionToComponentLot,
        },
        {
          provide: getRepositoryToken(ApplicationPaused),
          useValue: mockApplicationPausedRepository,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionConditionDate),
          useValue: mockApplicationDecisionConditionDate,
        },
        {
          provide: getRepositoryToken(ApplicationModification),
          useValue: mockApplicationModificationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationReconsideration),
          useValue: mockApplicationReconsiderationRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionConditionService>(ApplicationDecisionConditionService);
    timeTrackingService = module.get<ApplicationTimeTrackingService>(ApplicationTimeTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repo to get one or fails with correct parameters', async () => {
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(new ApplicationDecisionCondition());

    const result = await service.getOneOrFail('fake');

    expect(mockApplicationDecisionConditionRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockApplicationDecisionConditionRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'fake' },
      relations: { type: true, dates: true },
    });
    expect(result).toBeDefined();
  });

  it('calls remove method for deleted conditions', async () => {
    const conditions = [new ApplicationDecisionCondition(), new ApplicationDecisionCondition()];

    const mockTransaction = jest.fn();
    mockApplicationDecisionConditionRepository.manager.transaction = mockTransaction;

    mockApplicationDecisionConditionRepository.remove.mockResolvedValue({} as ApplicationDecisionCondition);
    mockApplicationDecisionConditionToComponentLot.find.mockResolvedValue([]);

    await service.remove(conditions);

    expect(mockTransaction).toBeCalledTimes(1);
  });

  it('should create new components when given a DTO without a UUID', async () => {
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(new ApplicationDecisionCondition());

    const updateDtos: UpdateApplicationDecisionConditionDto[] = [{}, {}];

    const result = await service.createOrUpdate(updateDtos, [], [], false);

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(mockApplicationDecisionConditionRepository.findOneOrFail).toBeCalledTimes(0);
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
    expect(mockApplicationDecisionConditionRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockApplicationDecisionConditionRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: 'uuid' },
      relations: { type: true, dates: true },
    });
    expect(result[0].uuid).toEqual(mockDto.uuid);
  });

  it('should persist entity if persist flag is true', async () => {
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(new ApplicationDecisionCondition());
    mockApplicationDecisionConditionRepository.save.mockResolvedValue(new ApplicationDecisionCondition());

    const updateDtos: UpdateApplicationDecisionConditionDto[] = [{}];

    const result = await service.createOrUpdate(updateDtos, [], [], true);

    expect(result).toBeDefined();
    expect(mockApplicationDecisionConditionRepository.findOneOrFail).toBeCalledTimes(0);
    expect(mockApplicationDecisionConditionRepository.save).toBeCalledTimes(1);
  });

  it('should not persist entity if persist flag is false', async () => {
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(new ApplicationDecisionCondition());
    mockApplicationDecisionConditionRepository.save.mockResolvedValue(new ApplicationDecisionCondition());

    const updateDtos: UpdateApplicationDecisionConditionDto[] = [{}];

    const result = await service.createOrUpdate(updateDtos, [], [], false);

    expect(result).toBeDefined();
    expect(mockApplicationDecisionConditionRepository.findOneOrFail).toBeCalledTimes(0);
    expect(mockApplicationDecisionConditionRepository.save).toBeCalledTimes(0);
  });

  it('should call update on the repo and return the updated object', async () => {
    const mockCondition = new ApplicationDecisionCondition();

    mockApplicationDecisionConditionRepository.update.mockResolvedValue({} as any);
    mockApplicationDecisionConditionRepository.findOneOrFail.mockResolvedValue(mockCondition);

    const result = await service.update(mockCondition, {
      administrativeFee: 0,
    });

    expect(mockApplicationDecisionConditionRepository.update).toHaveBeenCalledTimes(1);
    expect(mockApplicationDecisionConditionRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCondition);
  });

  it('should call findBy on the repo for getPlanNumbers', async () => {
    mockApplicationDecisionConditionComponentPlanNumber.findBy.mockResolvedValue([]);

    const planNumbers = await service.getPlanNumbers('uuid');

    expect(mockApplicationDecisionConditionComponentPlanNumber.findBy).toHaveBeenCalledTimes(1);
    expect(planNumbers).toBeDefined();
  });

  it('should create a new join record if one does not exist for updateConditionPlanNumbers', async () => {
    mockApplicationDecisionConditionComponentPlanNumber.findOneBy.mockResolvedValue(null);
    mockApplicationDecisionConditionComponentPlanNumber.save.mockResolvedValue(
      new ApplicationDecisionConditionComponentPlanNumber(),
    );

    await service.updateConditionPlanNumbers('uuid', 'uuid', 'plan-number');

    expect(mockApplicationDecisionConditionComponentPlanNumber.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockApplicationDecisionConditionComponentPlanNumber.save).toHaveBeenCalledTimes(1);

    const savedEntity = mockApplicationDecisionConditionComponentPlanNumber.save.mock.calls[0][0];
    expect(savedEntity.planNumbers).toEqual('plan-number');
  });

  it('should update the existing  join record if one does exist for updateConditionPlanNumbers', async () => {
    const mockNumber = new ApplicationDecisionConditionComponentPlanNumber();
    mockApplicationDecisionConditionComponentPlanNumber.findOneBy.mockResolvedValue(mockNumber);
    mockApplicationDecisionConditionComponentPlanNumber.save.mockResolvedValue(
      new ApplicationDecisionConditionComponentPlanNumber(),
    );

    await service.updateConditionPlanNumbers('uuid', 'uuid', 'plan-number');

    expect(mockApplicationDecisionConditionComponentPlanNumber.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockApplicationDecisionConditionComponentPlanNumber.save).toHaveBeenCalledTimes(1);

    const savedEntity = mockApplicationDecisionConditionComponentPlanNumber.save.mock.calls[0][0];
    expect(savedEntity).toBe(mockNumber);
    expect(savedEntity.planNumbers).toEqual('plan-number');
    expect(mockNumber.planNumbers).toEqual('plan-number');
  });
});
