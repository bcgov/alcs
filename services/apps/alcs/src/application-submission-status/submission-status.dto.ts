import { BaseCodeDto } from '../common/dtos/base.dto';

export enum SUBMISSION_STATUS {
  IN_PROGRESS = 'PROG',
  INCOMPLETE = 'INCM', // L/FNG Returned as Incomplete
  WRONG_GOV = 'WRNG', //Wrong L/FNG
  SUBMITTED_TO_LG = 'SUBG', //Submitted to L/FNG
  IN_REVIEW_BY_LG = 'REVG', //new Under Review by L/FNG
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  SUBMITTED_TO_ALC_INCOMPLETE = 'SUIN', //new Submitted to ALC - Incomplete
  RECEIVED_BY_ALC = 'RECA', //new Received By ALC
  IN_REVIEW_BY_ALC = 'REVA', //new Under Review by ALC
  ALC_DECISION = 'ALCD', // Decision Released
  REFUSED_TO_FORWARD_LG = 'RFFG', //new L/FNG Refused to Forward
  CANCELLED = 'CANC',
}

export class ApplicationStatusDto extends BaseCodeDto {}
