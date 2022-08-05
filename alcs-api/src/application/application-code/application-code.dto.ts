import { ApplicationStatusDto } from '../application-status/application-status.dto';
import { ApplicationDecisionMakerDto } from './application-decision-maker/application-decision-maker.dto';
import { ApplicationTypeDto } from './application-type/application-type.dto';

export class ApplicationMasterCodesDto {
  type: ApplicationTypeDto[];
  status: ApplicationStatusDto[];
  decisionMaker: ApplicationDecisionMakerDto[];
}
