import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationDecisionConditionFinancialInstrumentService } from './application-decision-condition-financial-instrument.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ApplicationDecisionConditionFinancialInstrument,
  HeldBy,
  InstrumentStatus,
  InstrumentType,
} from './application-decision-condition-financial-instrument.entity';
import { ApplicationDecisionCondition } from '../application-decision-condition.entity';
import { ApplicationDecisionConditionType } from '../application-decision-condition-code.entity';
import { Repository } from 'typeorm';
import { CreateUpdateApplicationDecisionConditionFinancialInstrumentDto } from './application-decision-condition-financial-instrument.dto';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import {
  ServiceInternalErrorException,
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import {
  initApplicationDecisionConditionFinancialInstrumentMockEntity,
  initApplicationDecisionConditionTypeMockEntity,
} from '../../../../../test/mocks/mockEntities';

describe('ApplicationDecisionConditionFinancialInstrumentService', () => {
  let service: ApplicationDecisionConditionFinancialInstrumentService;
  let mockRepository: DeepMocked<Repository<ApplicationDecisionConditionFinancialInstrument>>;
  let mockConditionRepository: DeepMocked<Repository<ApplicationDecisionCondition>>;
  let mockConditionTypeRepository: DeepMocked<Repository<ApplicationDecisionConditionType>>;
  let mockApplicationDecisionConditionType;
  let mockApplicationDecisionConditionFinancialInstrument;

  beforeEach(async () => {
    mockRepository = createMock();
    mockConditionRepository = createMock();
    mockConditionTypeRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDecisionConditionFinancialInstrumentService,
        {
          provide: getRepositoryToken(ApplicationDecisionConditionFinancialInstrument),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionCondition),
          useValue: mockConditionRepository,
        },
        {
          provide: getRepositoryToken(ApplicationDecisionConditionType),
          useValue: mockConditionTypeRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionConditionFinancialInstrumentService>(
      ApplicationDecisionConditionFinancialInstrumentService,
    );

    mockApplicationDecisionConditionType = initApplicationDecisionConditionTypeMockEntity('BOND');
    mockApplicationDecisionConditionFinancialInstrument =
      initApplicationDecisionConditionFinancialInstrumentMockEntity();
  });

  describe('getAll', () => {
    it('should return all financial instruments for a condition', async () => {
      const conditionUuid = 'condition-uuid';
      const condition = new ApplicationDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstruments = [mockApplicationDecisionConditionFinancialInstrument];

      mockConditionTypeRepository.findOne.mockResolvedValue(mockApplicationDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.find.mockResolvedValue(financialInstruments);

      const result = await service.getAll(conditionUuid);

      expect(result).toEqual(financialInstruments);
      expect(mockConditionTypeRepository.findOne).toHaveBeenCalledWith({ where: { code: 'BOND' } });
      expect(mockConditionRepository.findOne).toHaveBeenCalledWith({ where: { uuid: conditionUuid } });
      expect(mockRepository.find).toHaveBeenCalledWith({ where: { condition: { uuid: conditionUuid } } });
    });

    it('should throw an error if condition type does not exist', async () => {
      mockConditionTypeRepository.findOne.mockResolvedValue(null);

      await expect(service.getAll('condition-uuid')).rejects.toThrow(ServiceInternalErrorException);
    });

    it('should throw an error if condition is not found', async () => {
      mockConditionTypeRepository.findOne.mockResolvedValue(mockApplicationDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(null);

      await expect(service.getAll('condition-uuid')).rejects.toThrow(ServiceNotFoundException);
    });

    it('should throw an error if condition is not of type Financial Security', async () => {
      const conditionUuid = 'condition-uuid';
      const condition = new ApplicationDecisionCondition({ uuid: conditionUuid, typeCode: 'OTHER' });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockApplicationDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);

      await expect(service.getAll(conditionUuid)).rejects.toThrow(ServiceValidationException);
    });
  });

  describe('getByUuid', () => {
    it('should return a financial instrument by uuid', async () => {
      const conditionUuid = 'condition-uuid';
      const uuid = 'instrument-uuid';
      const condition = new ApplicationDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstrument = new ApplicationDecisionConditionFinancialInstrument({ uuid });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockApplicationDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.findOne.mockResolvedValue(financialInstrument);

      const result = await service.getByUuid(conditionUuid, uuid);

      expect(result).toEqual(financialInstrument);
      expect(mockConditionTypeRepository.findOne).toHaveBeenCalledWith({
        where: { code: mockApplicationDecisionConditionType.code },
      });
      expect(mockConditionRepository.findOne).toHaveBeenCalledWith({ where: { uuid: conditionUuid } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { uuid, condition: { uuid: conditionUuid } } });
    });

    it('should throw an error if financial instrument is not found', async () => {
      const conditionUuid = 'condition-uuid';
      const uuid = 'instrument-uuid';
      const condition = new ApplicationDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockApplicationDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getByUuid(conditionUuid, uuid)).rejects.toThrow(ServiceNotFoundException);
    });
  });

  describe('create', () => {
    it('should create a financial instrument', async () => {
      const conditionUuid = 'condition-uuid';
      const dto: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto = {
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date().getTime(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date().getTime(),
        status: InstrumentStatus.RECEIVED,
      };
      const condition = new ApplicationDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstrument = mockApplicationDecisionConditionFinancialInstrument;

      mockConditionTypeRepository.findOne.mockResolvedValue(mockApplicationDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.save.mockResolvedValue(financialInstrument);

      const result = await service.create(conditionUuid, dto);

      expect(result).toEqual(financialInstrument);
      expect(mockConditionTypeRepository.findOne).toHaveBeenCalledWith({
        where: { code: mockApplicationDecisionConditionType.code },
      });
      expect(mockConditionRepository.findOne).toHaveBeenCalledWith({ where: { uuid: conditionUuid } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(ApplicationDecisionConditionFinancialInstrument));
    });
  });

  describe('update', () => {
    it('should update a financial instrument', async () => {
      const conditionUuid = 'condition-uuid';
      const uuid = 'instrument-uuid';
      const dto: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto = {
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date().getTime(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date().getTime(),
        status: InstrumentStatus.RECEIVED,
      };
      const condition = new ApplicationDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstrument = new ApplicationDecisionConditionFinancialInstrument({ uuid });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockApplicationDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.findOne.mockResolvedValue(financialInstrument);
      mockRepository.save.mockResolvedValue(financialInstrument);

      const result = await service.update(conditionUuid, uuid, dto);

      expect(result).toEqual(financialInstrument);
      expect(mockConditionTypeRepository.findOne).toHaveBeenCalledWith({
        where: { code: mockApplicationDecisionConditionType.code },
      });
      expect(mockConditionRepository.findOne).toHaveBeenCalledWith({ where: { uuid: conditionUuid } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { uuid, condition: { uuid: conditionUuid } } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(ApplicationDecisionConditionFinancialInstrument));
    });
  });

  describe('softRemove', () => {
    it('should soft remove a financial instrument', async () => {
      const conditionUuid = 'condition-uuid';
      const uuid = 'instrument-uuid';
      const condition = new ApplicationDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstrument = new ApplicationDecisionConditionFinancialInstrument({ uuid });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockApplicationDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.findOne.mockResolvedValue(financialInstrument);
      mockRepository.softRemove.mockResolvedValue(financialInstrument);

      const result = await service.softRemove(conditionUuid, uuid);

      expect(result).toEqual(financialInstrument);
      expect(mockConditionTypeRepository.findOne).toHaveBeenCalledWith({ where: { code: 'BOND' } });
      expect(mockConditionRepository.findOne).toHaveBeenCalledWith({ where: { uuid: conditionUuid } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { uuid, condition: { uuid: conditionUuid } } });
      expect(mockRepository.softRemove).toHaveBeenCalledWith(financialInstrument);
    });
  });
});
