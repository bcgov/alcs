import { Inject, Injectable } from '@nestjs/common';
import {
  ApplicationDecisionConditionFinancialInstrument,
  InstrumentStatus,
  InstrumentType,
} from './application-decision-condition-financial-instrument.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ServiceInternalErrorException,
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import { CreateUpdateApplicationDecisionConditionFinancialInstrumentDto } from './application-decision-condition-financial-instrument.dto';
import { ApplicationDecisionCondition } from '../application-decision-condition.entity';
import { ApplicationDecisionConditionType } from '../application-decision-condition-code.entity';

export enum ConditionType {
  FINANCIAL_SECURITY = 'BOND',
}

@Injectable()
export class ApplicationDecisionConditionFinancialInstrumentService {
  constructor(
    @InjectRepository(ApplicationDecisionConditionFinancialInstrument)
    private readonly repository: Repository<ApplicationDecisionConditionFinancialInstrument>,
    @InjectRepository(ApplicationDecisionCondition)
    private readonly applicationDecisionConditionRepository: Repository<ApplicationDecisionCondition>,
    @InjectRepository(ApplicationDecisionConditionType)
    private readonly applicationDecisionConditionTypeRepository: Repository<ApplicationDecisionConditionType>,
  ) {}

  async throwErrorIfFinancialSecurityTypeNotExists(): Promise<void> {
    const exists = await this.applicationDecisionConditionTypeRepository.findOne({
      where: { code: ConditionType.FINANCIAL_SECURITY },
    });
    if (!exists) {
      throw new ServiceInternalErrorException('Condition type Financial Security not found');
    }
  }

  async getAll(conditionUuid: string): Promise<ApplicationDecisionConditionFinancialInstrument[]> {
    await this.throwErrorIfFinancialSecurityTypeNotExists();

    const condition = await this.applicationDecisionConditionRepository.findOne({ where: { uuid: conditionUuid } });

    if (!condition) {
      throw new ServiceNotFoundException(`Condition with uuid ${conditionUuid} not found`);
    }

    if (condition.typeCode !== ConditionType.FINANCIAL_SECURITY) {
      throw new ServiceValidationException(`Condition with uuid ${conditionUuid} is not of type Financial Security`);
    }

    return this.repository.find({ where: { condition: { uuid: conditionUuid } } });
  }

  async getByUuid(conditionUuid: string, uuid: string): Promise<ApplicationDecisionConditionFinancialInstrument> {
    await this.throwErrorIfFinancialSecurityTypeNotExists();

    const condition = await this.applicationDecisionConditionRepository.findOne({ where: { uuid: conditionUuid } });

    if (!condition) {
      throw new ServiceNotFoundException(`Condition with uuid ${conditionUuid} not found`);
    }

    if (condition.typeCode !== ConditionType.FINANCIAL_SECURITY) {
      throw new ServiceValidationException(`Condition with uuid ${conditionUuid} is not of type Financial Security`);
    }

    const financialInstrument = await this.repository.findOne({ where: { uuid, condition: { uuid: conditionUuid } } });

    if (!financialInstrument) {
      throw new ServiceNotFoundException(`Financial Instrument with uuid ${uuid} not found`);
    }

    return financialInstrument;
  }

  async create(
    conditionUuid: string,
    dto: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
  ): Promise<ApplicationDecisionConditionFinancialInstrument> {
    await this.throwErrorIfFinancialSecurityTypeNotExists();

    const condition = await this.applicationDecisionConditionRepository.findOne({ where: { uuid: conditionUuid } });

    if (!condition) {
      throw new ServiceNotFoundException(`Condition with uuid ${conditionUuid} not found`);
    }

    if (condition.typeCode !== ConditionType.FINANCIAL_SECURITY) {
      throw new ServiceValidationException(`Condition with uuid ${conditionUuid} is not of type Financial Security`);
    }

    let instrument = new ApplicationDecisionConditionFinancialInstrument();
    instrument = this.mapDtoToEntity(dto, instrument);
    instrument.condition = condition;

    return this.repository.save(instrument);
  }

  async update(
    conditionUuid: string,
    uuid: string,
    dto: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
  ): Promise<ApplicationDecisionConditionFinancialInstrument> {
    await this.throwErrorIfFinancialSecurityTypeNotExists();

    const condition = await this.applicationDecisionConditionRepository.findOne({ where: { uuid: conditionUuid } });

    if (!condition) {
      throw new ServiceNotFoundException(`Condition with uuid ${conditionUuid} not found`);
    }

    if (condition.typeCode !== ConditionType.FINANCIAL_SECURITY) {
      throw new ServiceValidationException(`Condition with uuid ${conditionUuid} is not of type Financial Security`);
    }

    let instrument = await this.repository.findOne({ where: { uuid, condition: { uuid: conditionUuid } } });

    if (!instrument) {
      throw new ServiceNotFoundException(`Instrument with uuid ${uuid} not found`);
    }

    instrument = this.mapDtoToEntity(dto, instrument);

    return this.repository.save(instrument);
  }

  async remove(conditionUuid: string, uuid: string): Promise<ApplicationDecisionConditionFinancialInstrument> {
    await this.throwErrorIfFinancialSecurityTypeNotExists();

    const condition = await this.applicationDecisionConditionRepository.findOne({ where: { uuid: conditionUuid } });

    if (!condition) {
      throw new ServiceNotFoundException(`Condition with uuid ${conditionUuid} not found`);
    }

    if (condition.typeCode !== ConditionType.FINANCIAL_SECURITY) {
      throw new ServiceValidationException(`Condition with uuid ${conditionUuid} is not of type Financial Security`);
    }

    const instrument = await this.repository.findOne({ where: { uuid, condition: { uuid: conditionUuid } } });

    if (!instrument) {
      throw new ServiceNotFoundException(`Instrument with uuid ${uuid} not found`);
    }

    return await this.repository.remove(instrument);
  }

  private mapDtoToEntity(
    dto: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
    entity: ApplicationDecisionConditionFinancialInstrument,
  ): ApplicationDecisionConditionFinancialInstrument {
    entity.securityHolderPayee = dto.securityHolderPayee;
    entity.type = dto.type;
    entity.issueDate = new Date(dto.issueDate);
    entity.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    entity.amount = dto.amount;
    entity.bank = dto.bank;
    if (dto.type !== InstrumentType.EFT && !dto.instrumentNumber) {
      throw new ServiceValidationException('Instrument number is required when type is not EFT');
    }
    entity.instrumentNumber = dto.instrumentNumber ?? null;
    entity.heldBy = dto.heldBy;
    entity.receivedDate = new Date(dto.receivedDate);
    entity.notes = dto.notes ?? null;
    entity.status = dto.status;
    if (dto.status !== InstrumentStatus.RECEIVED) {
      if (!dto.statusDate || !dto.explanation) {
        throw new ServiceValidationException('Status date and explanation are required when status is not RECEIVED');
      }
      entity.statusDate = new Date(dto.statusDate);
      entity.explanation = dto.explanation;
    } else {
      if (dto.statusDate || dto.explanation) {
        throw new ServiceValidationException('Status date and explanation are not allowed when status is RECEIVED');
      }
      entity.statusDate = null;
      entity.explanation = null;
    }
    return entity;
  }
}
