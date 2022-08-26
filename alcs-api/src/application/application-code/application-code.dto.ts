import { ApplicationStatusDto } from '../application-status/application-status.dto';
import { ApplicationRegionDto } from './application-region/application-region.dto';
import { ApplicationTypeDto } from './application-type/application-type.dto';

export class ApplicationMasterCodesDto {
  type: ApplicationTypeDto[];
  status: ApplicationStatusDto[];
  region: ApplicationRegionDto[];
}
