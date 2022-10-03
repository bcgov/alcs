import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ReconsiderationTypeDto } from '../card/card.dto';

export interface CardStatusDto extends BaseCodeDto {}
export interface ApplicationRegionDto extends BaseCodeDto {}

export interface ApplicationTypeDto extends BaseCodeDto {
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
}
export interface ApplicationMasterCodesDto {
  type: ApplicationTypeDto[];
  status: CardStatusDto[];
  region: ApplicationRegionDto[];
  reconsiderationType: ReconsiderationTypeDto[];
}
