import { AutoMap } from 'automapper-classes';
import { BaseCodeDto } from '../../../../common/dtos/base.dto';

export class ApplicationTypeDto extends BaseCodeDto {
  @AutoMap()
  shortLabel: string;

  @AutoMap()
  backgroundColor: string;

  @AutoMap()
  textColor: string;

  @AutoMap()
  requiresGovernmentReview: boolean;

  @AutoMap()
  portalOrder: number;

  @AutoMap()
  alcFeeAmount?: number | null;

  @AutoMap()
  governmentFeeAmount?: number | null;
}
