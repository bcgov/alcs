import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ReconsiderationTypeDto } from '../card/card-code.dto';

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
  region: ApplicationRegionDto[];
  reconsiderationType: ReconsiderationTypeDto[];
}
