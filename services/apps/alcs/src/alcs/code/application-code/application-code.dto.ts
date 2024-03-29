import { ApplicationStatusDto } from '../../application/application-submission-status/submission-status.dto';
import { ReconsiderationTypeDto } from '../../application-decision/application-reconsideration/application-reconsideration.dto';
import { CardStatusDto } from '../../card/card-status/card-status.dto';
import { ApplicationRegionDto } from './application-region/application-region.dto';
import { ApplicationTypeDto } from './application-type/application-type.dto';

export class MasterCodesDto {
  type: ApplicationTypeDto[];
  status: CardStatusDto[];
  region: ApplicationRegionDto[];
  reconsiderationType: ReconsiderationTypeDto[];
  applicationStatusType: ApplicationStatusDto[];
}
