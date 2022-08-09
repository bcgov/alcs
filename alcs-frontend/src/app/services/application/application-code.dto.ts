import { BaseCodeDto } from '../../shared/dto/base.dto';

export interface ApplicationDecisionMakerDto extends BaseCodeDto {}
export interface ApplicationStatusDto extends BaseCodeDto {}
export interface ApplicationRegionDto extends BaseCodeDto {}

export interface ApplicationTypeDto extends BaseCodeDto {
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
}

export interface ApplicationMasterCodesDto {
  type: ApplicationTypeDto[];
  status: ApplicationStatusDto[];
  decisionMaker: ApplicationDecisionMakerDto[];
  region: ApplicationRegionDto[];
}
