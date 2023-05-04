import { ApplicationStatusDto } from '../../../portal/application-submission/application-status/application-status.dto';
import { CardStatusDto } from '../../card/card-status/card-status.dto';
import { ReconsiderationTypeDto } from '../../decision/application-reconsideration/application-reconsideration.dto';
import { ApplicationRegionDto } from './application-region/application-region.dto';
import { ApplicationTypeDto } from './application-type/application-type.dto';

export class MasterCodesDto {
  type: ApplicationTypeDto[];
  status: CardStatusDto[];
  region: ApplicationRegionDto[];
  reconsiderationType: ReconsiderationTypeDto[];
  applicationStatusType: ApplicationStatusDto[];
}
