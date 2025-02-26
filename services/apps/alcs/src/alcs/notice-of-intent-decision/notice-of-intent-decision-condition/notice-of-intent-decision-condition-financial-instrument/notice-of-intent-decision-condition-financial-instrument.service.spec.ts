import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentDecisionConditionFinancialInstrumentService } from './notice-of-intent-decision-condition-financial-instrument.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NoticeOfIntentDecisionConditionFinancialInstrument,
  HeldBy,
  InstrumentStatus,
  InstrumentType,
} from './notice-of-intent-decision-condition-financial-instrument.entity';
import { NoticeOfIntentDecisionCondition } from '../notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionType } from '../notice-of-intent-decision-condition-code.entity';
import { Repository } from 'typeorm';
import { CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto } from './notice-of-intent-decision-condition-financial-instrument.dto';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import {
  ServiceInternalErrorException,
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import {
  initNoticeOfIntentDecisionConditionFinancialInstrumentMockEntity,
  initNoticeOfIntentDecisionConditionTypeMockEntity,
} from '../../../../../test/mocks/mockEntities';

describe('NoticeOfIntentDecisionConditionFinancialInstrumentService', () => {
  let service: NoticeOfIntentDecisionConditionFinancialInstrumentService;
  let mockRepository: DeepMocked<Repository<NoticeOfIntentDecisionConditionFinancialInstrument>>;
  let mockConditionRepository: DeepMocked<Repository<NoticeOfIntentDecisionCondition>>;
  let mockConditionTypeRepository: DeepMocked<Repository<NoticeOfIntentDecisionConditionType>>;
  let mockNoticeOfIntentDecisionConditionType;
  let mockNoticeOfIntentDecisionConditionFinancialInstrument;

  beforeEach(async () => {
    mockRepository = createMock();
    mockConditionRepository = createMock();
    mockConditionTypeRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentDecisionConditionFinancialInstrumentService,
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionConditionFinancialInstrument),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionCondition),
          useValue: mockConditionRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentDecisionConditionType),
          useValue: mockConditionTypeRepository,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentDecisionConditionFinancialInstrumentService>(
      NoticeOfIntentDecisionConditionFinancialInstrumentService,
    );

    mockNoticeOfIntentDecisionConditionType = initNoticeOfIntentDecisionConditionTypeMockEntity('BOND');
    mockNoticeOfIntentDecisionConditionFinancialInstrument =
      initNoticeOfIntentDecisionConditionFinancialInstrumentMockEntity();
  });

  describe('getAll', () => {
    it('should return all financial instruments for a condition', async () => {
      const conditionUuid = 'condition-uuid';
      const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstruments = [mockNoticeOfIntentDecisionConditionFinancialInstrument];

      mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
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
      mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(null);

      await expect(service.getAll('condition-uuid')).rejects.toThrow(ServiceNotFoundException);
    });

    it('should throw an error if condition is not of type Financial Security', async () => {
      const conditionUuid = 'condition-uuid';
      const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'OTHER' });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);

      await expect(service.getAll(conditionUuid)).rejects.toThrow(ServiceValidationException);
    });
  });

  describe('getByUuid', () => {
    it('should return a financial instrument by uuid', async () => {
      const conditionUuid = 'condition-uuid';
      const uuid = 'instrument-uuid';
      const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstrument = new NoticeOfIntentDecisionConditionFinancialInstrument({ uuid });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.findOne.mockResolvedValue(financialInstrument);

      const result = await service.getByUuid(conditionUuid, uuid);

      expect(result).toEqual(financialInstrument);
      expect(mockConditionTypeRepository.findOne).toHaveBeenCalledWith({
        where: { code: mockNoticeOfIntentDecisionConditionType.code },
      });
      expect(mockConditionRepository.findOne).toHaveBeenCalledWith({ where: { uuid: conditionUuid } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { uuid, condition: { uuid: conditionUuid } } });
    });

    it('should throw an error if financial instrument is not found', async () => {
      const conditionUuid = 'condition-uuid';
      const uuid = 'instrument-uuid';
      const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getByUuid(conditionUuid, uuid)).rejects.toThrow(ServiceNotFoundException);
    });
  });

  describe('create', () => {
    it('should create a financial instrument', async () => {
      const conditionUuid = 'condition-uuid';
      const dto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto = {
        securityHolderPayee: 'holder',
        type: InstrumentType.EFT,
        issueDate: new Date().getTime(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date().getTime(),
        status: InstrumentStatus.RECEIVED,
      };
      const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstrument = mockNoticeOfIntentDecisionConditionFinancialInstrument;

      mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.save.mockResolvedValue(financialInstrument);

      const result = await service.create(conditionUuid, dto);

      expect(result).toEqual(financialInstrument);
      expect(mockConditionTypeRepository.findOne).toHaveBeenCalledWith({
        where: { code: mockNoticeOfIntentDecisionConditionType.code },
      });
      expect(mockConditionRepository.findOne).toHaveBeenCalledWith({ where: { uuid: conditionUuid } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(NoticeOfIntentDecisionConditionFinancialInstrument));
    });
  });

  describe('update', () => {
    it('should update a financial instrument', async () => {
      const conditionUuid = 'condition-uuid';
      const uuid = 'instrument-uuid';
      const dto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto = {
        securityHolderPayee: 'holder',
        type: InstrumentType.EFT,
        issueDate: new Date().getTime(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date().getTime(),
        status: InstrumentStatus.RECEIVED,
      };
      const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstrument = new NoticeOfIntentDecisionConditionFinancialInstrument({ uuid });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.findOne.mockResolvedValue(financialInstrument);
      mockRepository.save.mockResolvedValue(financialInstrument);

      const result = await service.update(conditionUuid, uuid, dto);

      expect(result).toEqual(financialInstrument);
      expect(mockConditionTypeRepository.findOne).toHaveBeenCalledWith({
        where: { code: mockNoticeOfIntentDecisionConditionType.code },
      });
      expect(mockConditionRepository.findOne).toHaveBeenCalledWith({ where: { uuid: conditionUuid } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { uuid, condition: { uuid: conditionUuid } } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(NoticeOfIntentDecisionConditionFinancialInstrument));
    });
  });

  describe('remove', () => {
    it('should remove a financial instrument', async () => {
      const conditionUuid = 'condition-uuid';
      const uuid = 'instrument-uuid';
      const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });
      const financialInstrument = new NoticeOfIntentDecisionConditionFinancialInstrument({ uuid });

      mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
      mockConditionRepository.findOne.mockResolvedValue(condition);
      mockRepository.findOne.mockResolvedValue(financialInstrument);
      mockRepository.remove.mockResolvedValue(financialInstrument);

      const result = await service.remove(conditionUuid, uuid);

      expect(result).toEqual(financialInstrument);
      expect(mockConditionTypeRepository.findOne).toHaveBeenCalledWith({ where: { code: 'BOND' } });
      expect(mockConditionRepository.findOne).toHaveBeenCalledWith({ where: { uuid: conditionUuid } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { uuid, condition: { uuid: conditionUuid } } });
      expect(mockRepository.remove).toHaveBeenCalledWith(financialInstrument);
    });
  });

  it('should throw an error if instrument number is missing when type is not EFT', async () => {
    const conditionUuid = 'condition-uuid';
    const dto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: 'holder',
      type: InstrumentType.BANK_DRAFT,
      issueDate: new Date().getTime(),
      amount: 100,
      bank: 'bank',
      heldBy: HeldBy.ALC,
      receivedDate: new Date().getTime(),
      status: InstrumentStatus.RECEIVED,
    };
    const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });

    mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
    mockConditionRepository.findOne.mockResolvedValue(condition);

    await expect(service.create(conditionUuid, dto)).rejects.toThrow(ServiceValidationException);
  });

  it('should throw an error if status date or explanation is missing when status is not RECEIVED', async () => {
    const conditionUuid = 'condition-uuid';
    const dto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: 'holder',
      type: InstrumentType.EFT,
      issueDate: new Date().getTime(),
      amount: 100,
      bank: 'bank',
      heldBy: HeldBy.ALC,
      receivedDate: new Date().getTime(),
      status: InstrumentStatus.CASHED,
    };
    const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });

    mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
    mockConditionRepository.findOne.mockResolvedValue(condition);

    await expect(service.create(conditionUuid, dto)).rejects.toThrow(ServiceValidationException);
  });

  it('should throw an error if status date or explanation is provided when status is RECEIVED', async () => {
    const conditionUuid = 'condition-uuid';
    const dto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: 'holder',
      type: InstrumentType.EFT,
      issueDate: new Date().getTime(),
      amount: 100,
      bank: 'bank',
      heldBy: HeldBy.ALC,
      receivedDate: new Date().getTime(),
      status: InstrumentStatus.RECEIVED,
      explanation: 'test',
      statusDate: new Date().getTime(),
    };
    const condition = new NoticeOfIntentDecisionCondition({ uuid: conditionUuid, typeCode: 'BOND' });

    mockConditionTypeRepository.findOne.mockResolvedValue(mockNoticeOfIntentDecisionConditionType);
    mockConditionRepository.findOne.mockResolvedValue(condition);

    await expect(service.create(conditionUuid, dto)).rejects.toThrow(ServiceValidationException);
  });
});
