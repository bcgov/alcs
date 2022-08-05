import { BaseCodeDto } from '../../shared/dto/base.dto';

export interface ApplicationDecisionMakerDto extends BaseCodeDto {
  label: string;
}

export interface ApplicationStatusDto extends BaseCodeDto {
  label: string;
}

export interface ApplicationTypeDto extends BaseCodeDto {
  label: string;
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
}

export interface ApplicationMasterCodesDto {
  type: ApplicationTypeDto[];
  status: ApplicationStatusDto[];
  decisionMaker: ApplicationDecisionMakerDto[];
}
