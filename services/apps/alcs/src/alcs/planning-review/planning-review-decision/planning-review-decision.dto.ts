import { AutoMap } from 'automapper-classes';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';
import { PlanningReviewDecisionOutcomeCode } from './planning-review-decision-outcome.entity';

export class UpdatePlanningReviewDecisionDto {
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

  @IsString()
  @IsOptional()
  decisionDescription?: string | null;

  @IsBoolean()
  isDraft: boolean;
}

export class CreatePlanningReviewDecisionDto {
  @IsString()
  planningReviewFileNumber: string;
}

export class PlanningReviewDecisionOutcomeCodeDto extends BaseCodeDto {}

export class PlanningReviewDecisionDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  planningReviewFileNumber: string;

  @AutoMap()
  date?: number;

  @AutoMap()
  resolutionNumber: string;

  @AutoMap()
  resolutionYear: number;

  @AutoMap(() => PlanningReviewDecisionOutcomeCodeDto)
  outcome?: PlanningReviewDecisionOutcomeCodeDto;

  @AutoMap(() => [PlanningReviewDecisionDocumentDto])
  documents: PlanningReviewDecisionDocumentDto[];

  @AutoMap(() => Boolean)
  isDraft: boolean;

  @AutoMap(() => String)
  decisionDescription?: string | null;

  @AutoMap(() => Number)
  createdAt?: number | null;

  @AutoMap(() => Boolean)
  wasReleased: boolean;
}

export class PlanningReviewDecisionDocumentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileName: string;

  @AutoMap()
  fileSize: number;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  uploadedBy: string;

  @AutoMap()
  uploadedAt: number;
}
