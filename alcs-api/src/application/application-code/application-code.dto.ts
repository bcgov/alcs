import { ApplicationStatusDto } from '../application-status/application-status.dto';
import { ApplicationDecisionMakerDto } from './application-decision-maker/application-decision-maker.dto';
import { ApplicationRegionDto } from './application-region/application-region.dto';
import { ApplicationTypeDto } from './application-type/application-type.dto';

export class ApplicationMasterCodesDto {
  type: ApplicationTypeDto[];
  status: ApplicationStatusDto[];
  decisionMaker: ApplicationDecisionMakerDto[];
  region: ApplicationRegionDto[];
}
