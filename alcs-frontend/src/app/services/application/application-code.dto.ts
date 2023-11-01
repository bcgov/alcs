import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ReconsiderationTypeDto } from './application-reconsideration/application-reconsideration.dto';
import { ApplicationStatusDto } from './application-submission-status/application-submission-status.dto';

export interface CardStatusDto extends BaseCodeDto {}
export interface ApplicationRegionDto extends BaseCodeDto {}

export interface ApplicationTypeDto extends BaseCodeDto {
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
  requiresGovernmentReview: boolean;
}

export interface ApplicationMasterCodesDto {
  type: ApplicationTypeDto[];
  status: CardStatusDto[];
  region: ApplicationRegionDto[];
  reconsiderationType: ReconsiderationTypeDto[];
  applicationStatusType: ApplicationStatusDto[];
}
