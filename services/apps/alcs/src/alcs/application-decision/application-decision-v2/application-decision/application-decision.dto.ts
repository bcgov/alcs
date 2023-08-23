import { AutoMap } from '@automapper/classes';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BaseCodeDto } from '../../../../common/dtos/base.dto';
import {
  ApplicationDecisionConditionDto,
  UpdateApplicationDecisionConditionDto,
} from '../../application-decision-condition/application-decision-condition.dto';
import { ApplicationDecisionMakerCodeDto } from '../../application-decision-maker/decision-maker.dto';
import { CeoCriterionCodeDto } from './ceo-criterion/ceo-criterion.dto';
import {
  ApplicationDecisionComponentDto,
  UpdateApplicationDecisionComponentDto,
} from './component/application-decision-component.dto';

export class UpdateApplicationDecisionDto {
  @IsNumber()
  @IsOptional()
  resolutionNumber?: number;

  @IsNumber()
  @IsOptional()
  resolutionYear?: number;

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
  isOther?: boolean | null;

  @IsString()
  @IsOptional()
  chairReviewOutcomeCode?: string | null;

  @IsString()
  @IsOptional()
  linkedResolutionOutcomeCode?: string | null;

  @IsUUID()
  @IsOptional()
  modifiesUuid?: string | null;

  @IsUUID()
  @IsOptional()
  reconsidersUuid?: string | null;

  @IsBoolean()
  @IsOptional()
  isSubjectToConditions?: boolean | null;

  @IsString()
  @IsOptional()
  decisionDescription?: string | null;

  @IsBoolean()
  @IsOptional()
  isStatsRequired?: boolean | null;

  @IsNumber()
  @IsOptional()
  rescindedDate?: number | null;

  @IsString()
  @IsOptional()
  rescindedComment?: string | null;

  @IsBoolean()
  isDraft: boolean;

  @IsOptional()
  decisionComponents?: UpdateApplicationDecisionComponentDto[];

  @IsOptional()
  @IsArray()
  conditions?: UpdateApplicationDecisionConditionDto[];
}

export class CreateApplicationDecisionDto extends UpdateApplicationDecisionDto {
  @IsString()
  applicationFileNumber;

  @IsNumber()
  date: number;

  @IsString()
  outcomeCode: string;

  @IsNumber()
  resolutionNumber: number;

  @IsNumber()
  resolutionYear: number;

  @IsBoolean()
  chairReviewRequired: boolean;

  @IsUUID()
  @IsOptional()
  modifiesUuid?: string;

  @IsOptional()
  override isDraft = true;
}

export class ApplicationDecisionOutcomeCodeDto extends BaseCodeDto {
  @AutoMap()
  isFirstDecision: boolean;
}

export class ChairReviewOutcomeCodeDto extends BaseCodeDto {}

export class LinkedResolutionOutcomeTypeDto extends BaseCodeDto {}

export class ApplicationDecisionDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  applicationFileNumber;

  @AutoMap()
  date?: number;

  @AutoMap(() => ApplicationDecisionOutcomeCodeDto)
  outcome: ApplicationDecisionOutcomeCodeDto;

  @AutoMap()
  resolutionNumber: string;

  @AutoMap()
  resolutionYear: number;

  @AutoMap()
  chairReviewRequired: boolean;

  @AutoMap(() => Boolean)
  isSubjectToConditions: boolean | null;

  @AutoMap()
  auditDate?: number | null;

  @AutoMap()
  chairReviewDate?: number | null;

  @AutoMap(() => ChairReviewOutcomeCodeDto)
  chairReviewOutcome?: ChairReviewOutcomeCodeDto | null;

  @AutoMap(() => LinkedResolutionOutcomeTypeDto)
  linkedResolutionOutcome?: LinkedResolutionOutcomeTypeDto | null;

  @AutoMap(() => [DecisionDocumentDto])
  documents: DecisionDocumentDto[];

  @AutoMap(() => ApplicationDecisionMakerCodeDto)
  decisionMaker?: ApplicationDecisionMakerCodeDto | null;

  @AutoMap(() => CeoCriterionCodeDto)
  ceoCriterion?: CeoCriterionCodeDto | null;

  @AutoMap(() => Boolean)
  isTimeExtension?: boolean | null;

  @AutoMap(() => Boolean)
  isOther?: boolean | null;

  @AutoMap(() => Boolean)
  isDraft: boolean;

  @AutoMap(() => String)
  decisionDescription?: string | null;

  @AutoMap(() => Boolean)
  isStatsRequired?: boolean | null;

  @AutoMap(() => Number)
  rescindedDate?: number | null;

  @AutoMap(() => String)
  rescindedComment?: string | null;

  @AutoMap(() => Number)
  createdAt?: number | null;

  @AutoMap(() => Boolean)
  wasReleased: boolean;

  reconsiders?: LinkedResolutionDto;
  modifies?: LinkedResolutionDto;
  reconsideredBy?: LinkedResolutionDto[];
  modifiedBy?: LinkedResolutionDto[];
  components?: ApplicationDecisionComponentDto[];

  @AutoMap(() => [ApplicationDecisionConditionDto])
  conditions?: ApplicationDecisionConditionDto[];
}

export class LinkedResolutionDto {
  uuid: string;
  linkedResolutions: string[];
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
