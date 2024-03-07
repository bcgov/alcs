import { AutoMap } from 'automapper-classes';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { LocalGovernmentDto } from '../local-government/local-government.dto';

export class PlanningReviewTypeDto extends BaseCodeDto {
  @AutoMap()
  shortLabel: string;

  @AutoMap()
  backgroundColor: string;

  @AutoMap()
  textColor: string;
}

export class CreatePlanningReviewDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  documentName: string;

  @IsNumber()
  @IsNotEmpty()
  submissionDate: number;

  @IsNumber()
  @IsOptional()
  dueDate?: number;

  @IsString()
  @IsNotEmpty()
  localGovernmentUuid: string;

  @IsString()
  @IsNotEmpty()
  typeCode: string;

  @IsString()
  @IsNotEmpty()
  regionCode: string;
}

export class PlanningReviewDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap(() => String)
  legacyId: string | null;

  @AutoMap()
  open: boolean;

  @AutoMap()
  documentName: string;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap()
  typeCode: string;

  @AutoMap()
  regionCode: string;

  @AutoMap(() => LocalGovernmentDto)
  localGovernment: LocalGovernmentDto;

  @AutoMap(() => ApplicationRegionDto)
  region: ApplicationRegionDto;

  @AutoMap(() => PlanningReviewTypeDto)
  type: PlanningReviewTypeDto;
}

export class PlanningReferralDto {
  dueDate: number;
  submissionDate: number;

  @AutoMap()
  referralDescription: string;

  @AutoMap(() => PlanningReviewDto)
  planningReview: PlanningReviewDto;

  @AutoMap(() => CardDto)
  card: CardDto;
}

export class PlanningReviewDetailedDto extends PlanningReviewDto {
  @AutoMap(() => [PlanningReferralDto])
  referrals: PlanningReferralDto[];
}

export class UpdatePlanningReviewDto {
  @IsString()
  @IsOptional()
  open?: boolean;

  @IsString()
  @IsOptional()
  typeCode?: string;
}
