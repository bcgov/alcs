import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationConditionToComponentLotService } from './application-condition-to-component-lot.service';
import { ApplicationDecisionConditionToComponentLot } from './application-decision-condition-to-component-lot.entity';

describe('ApplicationConditionToComponentLotService', () => {
  let service: ApplicationConditionToComponentLotService;
  let mockApplicationDecisionConditionToComponentLotRepository: DeepMocked<
    Repository<ApplicationDecisionConditionToComponentLot>
  >;

  beforeEach(async () => {
    mockApplicationDecisionConditionToComponentLotRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationConditionToComponentLotService,
        {
          provide: getRepositoryToken(
            ApplicationDecisionConditionToComponentLot,
          ),
          useValue: mockApplicationDecisionConditionToComponentLotRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationConditionToComponentLotService>(
      ApplicationConditionToComponentLotService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it(' it should successfully call repo to find data', async () => {
    mockApplicationDecisionConditionToComponentLotRepository.find.mockResolvedValue(
      [],
    );

    const result = await service.fetch('fake-1', 'fake-2');

    expect(result).toBeDefined;
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.find,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.find,
    ).toBeCalledWith({
      where: {
        conditionUuid: 'fake-2',
        componentLot: {
          componentUuid: 'fake-1',
        },
      },
    });
  });

  it('should create new conditionLot', async () => {
    mockApplicationDecisionConditionToComponentLotRepository.findOne.mockResolvedValue(
      new ApplicationDecisionConditionToComponentLot({
        componentLotUuid: '1',
        conditionUuid: '1',
      }),
    );

    mockApplicationDecisionConditionToComponentLotRepository.save.mockImplementation(
      (data: ApplicationDecisionConditionToComponentLot) =>
        Promise.resolve(data),
    );

    const result = await service.createOrUpdate('1', '1', 'plan1');

    expect(result.planNumbers).toEqual('plan1');
    expect(result.componentLotUuid).toEqual('1');
    expect(result.conditionUuid).toEqual('1');
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.findOne,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.findOne,
    ).toBeCalledWith({
      where: {
        componentLotUuid: '1',
        conditionUuid: '1',
      },
    });
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.save,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.save,
    ).toBeCalledWith(
      new ApplicationDecisionConditionToComponentLot({
        componentLotUuid: '1',
        conditionUuid: '1',
        planNumbers: 'plan1',
      }),
    );
  });

  it('should update an existing conditionLot', async () => {
    const existingConditionLot = new ApplicationDecisionConditionToComponentLot(
      {
        conditionUuid: '2',
        componentLotUuid: '2',
        planNumbers: 'plan2',
      },
    );

    mockApplicationDecisionConditionToComponentLotRepository.findOne.mockResolvedValue(
      existingConditionLot,
    );

    mockApplicationDecisionConditionToComponentLotRepository.save.mockImplementation(
      (data: ApplicationDecisionConditionToComponentLot) =>
        Promise.resolve(data),
    );

    const result = await service.createOrUpdate('2', '2', 'updatedPlan');

    expect(result.planNumbers).toEqual('updatedPlan');
    expect(result.componentLotUuid).toEqual('2');
    expect(result.conditionUuid).toEqual('2');
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.findOne,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.findOne,
    ).toBeCalledWith({
      where: {
        componentLotUuid: '2',
        conditionUuid: '2',
      },
    });
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.save,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationDecisionConditionToComponentLotRepository.save,
    ).toBeCalledWith(existingConditionLot);
  });
});
