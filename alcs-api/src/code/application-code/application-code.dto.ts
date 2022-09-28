import { CardStatusDto } from '../../card/card-status/card-status.dto';
import { ReconsiderationTypeDto } from '../../reconsideration/reconsideration-type/reconsideration-type.dto';
import { ApplicationRegionDto } from './application-region/application-region.dto';
import { ApplicationTypeDto } from './application-type/application-type.dto';

export class ApplicationMasterCodesDto {
  type: ApplicationTypeDto[];
  status: CardStatusDto[];
  region: ApplicationRegionDto[];
  reconsiderationType: ReconsiderationTypeDto[];
}
