import { AutoMap } from 'automapper-classes';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export enum SUBMISSION_STATUS {
  IN_PROGRESS = 'PROG',
  INCOMPLETE = 'INCM', // L/FNG Returned as Incomplete
  WRONG_GOV = 'WRNG', //Wrong L/FNG
  SUBMITTED_TO_LG = 'SUBG', //Submitted to L/FNG
  IN_REVIEW_BY_LG = 'REVG', //Under Review by L/FNG
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  SUBMITTED_TO_ALC_INCOMPLETE = 'SUIN', //new Submitted to ALC - Incomplete
  RECEIVED_BY_ALC = 'RECA', //Received By ALC
  IN_REVIEW_BY_ALC = 'REVA', //Under Review by ALC
  ALC_DECISION = 'ALCD', // Decision Released
  REFUSED_TO_FORWARD_LG = 'RFFG', //L/FNG Refused to Forward
  RETURNED_TO_LG = 'INCG', //Returned to L/FNG from ALC
  CANCELLED = 'CANC',
}

// TODO rename to better reflect the origin?
export class ApplicationStatusDto extends BaseCodeDto {
  @AutoMap()
  alcsBackgroundColor: string;

  @AutoMap()
  alcsColor: string;

  @AutoMap()
  portalBackgroundColor: string;

  @AutoMap()
  portalColor: string;

  @AutoMap()
  weight: number;
}

export class ApplicationSubmissionToSubmissionStatusDto {
  @AutoMap()
  submissionUuid: string;

  @AutoMap()
  effectiveDate: number;

  @AutoMap()
  statusTypeCode: string;

  @AutoMap(() => ApplicationStatusDto)
  status: ApplicationStatusDto;
}
