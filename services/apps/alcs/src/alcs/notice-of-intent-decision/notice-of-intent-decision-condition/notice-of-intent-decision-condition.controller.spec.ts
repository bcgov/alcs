import { classes } from 'automapper-classes';
import { AutomapperModule, InjectMapper } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentDecisionProfile } from '../../../common/automapper/notice-of-intent-decision.automapper.profile';
import { NoticeOfIntentDecisionConditionController } from './notice-of-intent-decision-condition.controller';
import { UpdateNoticeOfIntentDecisionConditionDto } from './notice-of-intent-decision-condition.dto';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionService } from './notice-of-intent-decision-condition.service';
import { NoticeOfIntentDecisionConditionFinancialInstrumentService } from './notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.service';
import {
  NoticeOfIntentDecisionConditionFinancialInstrument,
  HeldBy,
  InstrumentStatus,
  InstrumentType,
} from './notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.entity';
import { CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto } from './notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.dto';

describe('NoticeOfIntentDecisionConditionController', () => {
  let controller: NoticeOfIntentDecisionConditionController;
  let mockNOIDecisionConditionService: DeepMocked<NoticeOfIntentDecisionConditionService>;
  let mockFinancialInstrumentService: DeepMocked<NoticeOfIntentDecisionConditionFinancialInstrumentService>;

  beforeEach(async () => {
    mockNOIDecisionConditionService = createMock();
    mockFinancialInstrumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentDecisionConditionController],
      providers: [
        NoticeOfIntentDecisionProfile,
        {
          provide: NoticeOfIntentDecisionConditionService,
          useValue: mockNOIDecisionConditionService,
        },
        {
          provide: NoticeOfIntentDecisionConditionFinancialInstrumentService,
          useValue: mockFinancialInstrumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentDecisionConditionController>(NoticeOfIntentDecisionConditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    it('should update the condition and return updated condition', async () => {
      // Arrange
      const uuid = 'example-uuid';
      const updates: UpdateNoticeOfIntentDecisionConditionDto = {
        securityAmount: 1000,
        administrativeFee: 50,
        description: 'example description',
      };

      const condition = new NoticeOfIntentDecisionCondition({
        uuid,
        securityAmount: 500,
        administrativeFee: 25,
        description: 'existing description',
      });

      const updated = new NoticeOfIntentDecisionCondition({
        uuid,
        securityAmount: updates.securityAmount,
        administrativeFee: updates.administrativeFee,
        description: updates.description,
      });

      mockNOIDecisionConditionService.getOneOrFail.mockResolvedValue(condition);
      mockNOIDecisionConditionService.update.mockResolvedValue(updated);

      const result = await controller.update(uuid, updates);

      expect(mockNOIDecisionConditionService.getOneOrFail).toHaveBeenCalledWith(uuid);
      expect(mockNOIDecisionConditionService.update).toHaveBeenCalledWith(condition, {
        ...updates,
      });
      expect(result.description).toEqual(updated.description);
      expect(result.administrativeFee).toEqual(updated.administrativeFee);
      expect(result.securityAmount).toEqual(updated.securityAmount);
    });
  });

  describe('Financial Instruments', () => {
    const conditionUuid = 'condition-uuid';
    const instrumentUuid = 'instrument-uuid';
    const financialInstrumentDto: CreateUpdateNoticeOfIntentDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: 'holder',
      type: InstrumentType.BANK_DRAFT,
      issueDate: new Date().getTime(),
      amount: 100,
      bank: 'bank',
      heldBy: HeldBy.ALC,
      receivedDate: new Date().getTime(),
      status: InstrumentStatus.RECEIVED,
      instrumentNumber: '123',
      notes: 'notes',
      expiryDate: new Date().getTime(),
      statusDate: new Date().getTime(),
      explanation: 'explanation',
    };

    it('should get all financial instruments for a condition', async () => {
      const financialInstruments = [
        new NoticeOfIntentDecisionConditionFinancialInstrument({
          securityHolderPayee: 'holder',
          type: InstrumentType.BANK_DRAFT,
          issueDate: new Date(),
          amount: 100,
          bank: 'bank',
          heldBy: HeldBy.ALC,
          receivedDate: new Date(),
          status: InstrumentStatus.RECEIVED,
        }),
      ];
      mockFinancialInstrumentService.getAll.mockResolvedValue(financialInstruments);

      const result = await controller.getAllFinancialInstruments(conditionUuid);

      expect(mockFinancialInstrumentService.getAll).toHaveBeenCalledWith(conditionUuid);
      expect(result).toBeDefined();
    });

    it('should get a financial instrument by uuid', async () => {
      const financialInstrument = new NoticeOfIntentDecisionConditionFinancialInstrument({
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date(),
        status: InstrumentStatus.RECEIVED,
      });
      mockFinancialInstrumentService.getByUuid.mockResolvedValue(financialInstrument);

      const result = await controller.getFinancialInstrumentByUuid(conditionUuid, instrumentUuid);

      expect(mockFinancialInstrumentService.getByUuid).toHaveBeenCalledWith(conditionUuid, instrumentUuid);
      expect(result).toBeDefined();
    });

    it('should create a financial instrument', async () => {
      const financialInstrument = new NoticeOfIntentDecisionConditionFinancialInstrument({
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date(),
        status: InstrumentStatus.RECEIVED,
      });
      mockFinancialInstrumentService.create.mockResolvedValue(financialInstrument);

      const result = await controller.createFinancialInstrument(conditionUuid, financialInstrumentDto);

      expect(mockFinancialInstrumentService.create).toHaveBeenCalledWith(conditionUuid, financialInstrumentDto);
      expect(result).toBeDefined();
    });

    it('should update a financial instrument', async () => {
      const financialInstrument = new NoticeOfIntentDecisionConditionFinancialInstrument({
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date(),
        status: InstrumentStatus.RECEIVED,
      });
      mockFinancialInstrumentService.update.mockResolvedValue(financialInstrument);

      const result = await controller.updateFinancialInstrument(conditionUuid, instrumentUuid, financialInstrumentDto);

      expect(mockFinancialInstrumentService.update).toHaveBeenCalledWith(
        conditionUuid,
        instrumentUuid,
        financialInstrumentDto,
      );
      expect(result).toBeDefined();
    });

    it('should delete a financial instrument', async () => {
      const financialInstrument = new NoticeOfIntentDecisionConditionFinancialInstrument({
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date(),
        status: InstrumentStatus.RECEIVED,
      });
      mockFinancialInstrumentService.remove.mockResolvedValue(financialInstrument);

      const result = await controller.deleteFinancialInstrument(conditionUuid, instrumentUuid);

      expect(mockFinancialInstrumentService.remove).toHaveBeenCalledWith(conditionUuid, instrumentUuid);
      expect(result).toBeDefined();
    });
  });
});
