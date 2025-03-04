import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationDecisionConditionController } from './application-decision-condition.controller';
import { UpdateApplicationDecisionConditionDto } from './application-decision-condition.dto';
import { ApplicationDecisionCondition } from './application-decision-condition.entity';
import { ApplicationDecisionConditionService } from './application-decision-condition.service';
import { ApplicationDecisionConditionFinancialInstrumentService } from './application-decision-condition-financial-instrument/application-decision-condition-financial-instrument.service';
import {
  ApplicationDecisionConditionFinancialInstrument,
  HeldBy,
  InstrumentStatus,
  InstrumentType,
} from './application-decision-condition-financial-instrument/application-decision-condition-financial-instrument.entity';

describe('ApplicationDecisionConditionController', () => {
  let controller: ApplicationDecisionConditionController;
  let mockApplicationDecisionConditionService: DeepMocked<ApplicationDecisionConditionService>;
  let mockApplicationDecisionConditionFinancialInstrumentService: DeepMocked<ApplicationDecisionConditionFinancialInstrumentService>;

  beforeEach(async () => {
    mockApplicationDecisionConditionService = createMock();
    mockApplicationDecisionConditionFinancialInstrumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionConditionController],
      providers: [
        ApplicationDecisionProfile,
        {
          provide: ApplicationDecisionConditionService,
          useValue: mockApplicationDecisionConditionService,
        },
        {
          provide: ApplicationDecisionConditionFinancialInstrumentService,
          useValue: mockApplicationDecisionConditionFinancialInstrumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationDecisionConditionController>(ApplicationDecisionConditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    it('should update the condition and return updated condition', async () => {
      // Arrange
      const uuid = 'example-uuid';
      const date = new Date();
      const updates: UpdateApplicationDecisionConditionDto = {
        approvalDependant: true,
        securityAmount: 1000,
        administrativeFee: 50,
        description: 'example description',
      };

      const condition = new ApplicationDecisionCondition({
        uuid,
        approvalDependant: false,
        securityAmount: 500,
        administrativeFee: 25,
        description: 'existing description',
      });

      const updated = new ApplicationDecisionCondition({
        uuid,
        approvalDependant: updates.approvalDependant,
        securityAmount: updates.securityAmount,
        administrativeFee: updates.administrativeFee,
        description: updates.description,
      });

      mockApplicationDecisionConditionService.getOneOrFail.mockResolvedValue(condition);
      mockApplicationDecisionConditionService.update.mockResolvedValue(updated);

      const result = await controller.update(uuid, updates);

      expect(mockApplicationDecisionConditionService.getOneOrFail).toHaveBeenCalledWith(uuid);
      expect(mockApplicationDecisionConditionService.update).toHaveBeenCalledWith(condition, {
        ...updates,
      });
      expect(result.description).toEqual(updated.description);
      expect(result.administrativeFee).toEqual(updated.administrativeFee);
      expect(result.securityAmount).toEqual(updated.securityAmount);
      expect(result.approvalDependant).toEqual(updated.approvalDependant);
    });
  });

  describe('Financial Instruments', () => {
    const conditionUuid = 'condition-uuid';
    const instrumentUuid = 'instrument-uuid';
    const financialInstrumentDto = {
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
        new ApplicationDecisionConditionFinancialInstrument({
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
      mockApplicationDecisionConditionFinancialInstrumentService.getAll.mockResolvedValue(financialInstruments);

      const result = await controller.getAllFinancialInstruments(conditionUuid);

      expect(mockApplicationDecisionConditionFinancialInstrumentService.getAll).toHaveBeenCalledWith(conditionUuid);
      expect(result).toBeDefined();
    });

    it('should get a financial instrument by uuid', async () => {
      const financialInstrument = new ApplicationDecisionConditionFinancialInstrument({
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date(),
        status: InstrumentStatus.RECEIVED,
      });
      mockApplicationDecisionConditionFinancialInstrumentService.getByUuid.mockResolvedValue(financialInstrument);

      const result = await controller.getFinancialInstrumentByUuid(conditionUuid, instrumentUuid);

      expect(mockApplicationDecisionConditionFinancialInstrumentService.getByUuid).toHaveBeenCalledWith(
        conditionUuid,
        instrumentUuid,
      );
      expect(result).toBeDefined();
    });

    it('should create a financial instrument', async () => {
      const financialInstrument = new ApplicationDecisionConditionFinancialInstrument({
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date(),
        status: InstrumentStatus.RECEIVED,
      });
      mockApplicationDecisionConditionFinancialInstrumentService.create.mockResolvedValue(financialInstrument);

      const result = await controller.createFinancialInstrument(conditionUuid, financialInstrumentDto);

      expect(mockApplicationDecisionConditionFinancialInstrumentService.create).toHaveBeenCalledWith(
        conditionUuid,
        financialInstrumentDto,
      );
      expect(result).toBeDefined();
    });

    it('should update a financial instrument', async () => {
      const financialInstrument = new ApplicationDecisionConditionFinancialInstrument({
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date(),
        status: InstrumentStatus.RECEIVED,
      });
      mockApplicationDecisionConditionFinancialInstrumentService.update.mockResolvedValue(financialInstrument);

      const result = await controller.updateFinancialInstrument(conditionUuid, instrumentUuid, financialInstrumentDto);

      expect(mockApplicationDecisionConditionFinancialInstrumentService.update).toHaveBeenCalledWith(
        conditionUuid,
        instrumentUuid,
        financialInstrumentDto,
      );
      expect(result).toBeDefined();
    });

    it('should delete a financial instrument', async () => {
      const financialInstrument = new ApplicationDecisionConditionFinancialInstrument({
        securityHolderPayee: 'holder',
        type: InstrumentType.BANK_DRAFT,
        issueDate: new Date(),
        amount: 100,
        bank: 'bank',
        heldBy: HeldBy.ALC,
        receivedDate: new Date(),
        status: InstrumentStatus.RECEIVED,
      });
      mockApplicationDecisionConditionFinancialInstrumentService.remove.mockResolvedValue(financialInstrument);

      const result = await controller.deleteFinancialInstrument(conditionUuid, instrumentUuid);

      expect(mockApplicationDecisionConditionFinancialInstrumentService.remove).toHaveBeenCalledWith(
        conditionUuid,
        instrumentUuid,
      );
      expect(result).toBeDefined();
    });
  });
});
