import { AutoMap } from 'automapper-classes';
import { InstrumentType, HeldBy, InstrumentStatus } from './application-decision-condition-financial-instrument.entity';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';

export class ApplicationDecisionConditionFinancialInstrumentDto {
  @AutoMap()
  @IsUUID()
  uuid: string;

  @AutoMap()
  @IsString()
  securityHolderPayee: string;

  @AutoMap()
  @IsEnum(InstrumentType)
  type: InstrumentType;

  @AutoMap()
  @IsNumber()
  issueDate: number;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  expiryDate?: number | null;

  @AutoMap()
  @IsNumber()
  amount: number;

  @AutoMap()
  @IsString()
  bank: string;

  @AutoMap()
  @IsOptional()
  instrumentNumber?: string | null;

  @AutoMap()
  @IsEnum(HeldBy)
  heldBy: HeldBy;

  @AutoMap()
  @IsNumber()
  receivedDate: number;

  @AutoMap()
  @IsString()
  @IsOptional()
  notes?: string | null;

  @AutoMap()
  @IsEnum(InstrumentStatus)
  status: InstrumentStatus;

  @AutoMap()
  @IsOptional()
  @IsNumber()
  statusDate?: number | null;

  @AutoMap()
  @IsString()
  @IsOptional()
  explanation?: string | null;
}

export class CreateUpdateApplicationDecisionConditionFinancialInstrumentDto extends OmitType(
  ApplicationDecisionConditionFinancialInstrumentDto,
  ['uuid'] as const,
) {}
