import { BaseCodeDto } from '../../shared/dto/base.dto';

export interface ApplicationTypeDto extends BaseCodeDto {
  label: string;
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
}
