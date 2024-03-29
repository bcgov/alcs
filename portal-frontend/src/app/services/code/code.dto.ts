import { BaseCodeDto } from '../../shared/dto/base.dto';

export interface LocalGovernmentDto {
  uuid: string;
  name: string;
  hasGuid: boolean;
  matchesUserGuid: boolean;
}

export interface ApplicationRegionDto extends BaseCodeDto {}
export interface DecisionMakerDto extends BaseCodeDto {}

export interface SubmissionTypeDto extends BaseCodeDto {
  portalHtmlDescription: string;
}

export interface ApplicationTypeDto {
  code: string;
  portalLabel: string;
  htmlDescription: string;
  portalOrder: number;
  alcFeeAmount?: number | null;
  governmentFeeAmount?: number | null;
}

export interface NoticeOfIntentTypeDto {
  code: string;
  portalLabel: string;
  htmlDescription: string;
  alcFeeAmount?: number | null;
  governmentFeeAmount?: number | null;
}
