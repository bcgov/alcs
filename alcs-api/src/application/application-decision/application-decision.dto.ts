import { AutoMap } from '@automapper/classes';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { CeoCriterionCodeDto } from './ceo-criterion/ceo-criterion.dto';
import { DecisionMakerCodeDto } from './decision-maker/decision-maker.dto';

export class ApplicationDecisionOutcomeTypeDto extends BaseCodeDto {}

export class UpdateApplicationDecisionDto {
  @IsNumber()
  @IsOptional()
  date?: number;

  @IsString()
  @IsOptional()
  outcomeCode?: string;

  @IsNumber()
  @IsOptional()
  auditDate?: number | null;

  @IsBoolean()
  @IsOptional()
  chairReviewRequired?: boolean;

  @IsNumber()
  @IsOptional()
  chairReviewDate?: number | null;

  @IsString()
  @IsOptional()
  decisionMakerCode?: string | null;

  @IsString()
  @IsOptional()
  ceoCriterionCode?: string | null;

  @IsBoolean()
  @IsOptional()
  isTimeExtension?: boolean | null;

  @IsBoolean()
  @IsOptional()
  chairReviewOutcome?: boolean | null;
}

export class CreateApplicationDecisionDto extends UpdateApplicationDecisionDto {
  @IsString()
  applicationFileNumber;

  @IsNumber()
  date: number;

  @IsString()
  outcomeCode: string;

  @IsBoolean()
  chairReviewRequired: boolean;
}

export class ApplicationDecisionDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  applicationFileNumber;

  @AutoMap()
  date: number;

  @AutoMap()
  outcome: ApplicationDecisionOutcomeTypeDto;

  @AutoMap()
  chairReviewRequired: boolean;

  @AutoMap()
  auditDate?: number | null;

  @AutoMap()
  chairReviewDate?: number | null;

  @AutoMap()
  chairReviewOutcome?: boolean | null;

  @AutoMap()
  documents: DecisionDocumentDto[];

  @AutoMap()
  decisionMaker?: DecisionMakerCodeDto | null;

  @AutoMap()
  ceoCriterion?: CeoCriterionCodeDto | null;

  @AutoMap()
  isTimeExtension?: boolean | null;
}

export class DecisionDocumentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileName: string;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  uploadedBy: string;

  @AutoMap()
  uploadedAt: number;
}
