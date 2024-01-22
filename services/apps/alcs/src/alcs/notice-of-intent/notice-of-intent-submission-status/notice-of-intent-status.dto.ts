import { AutoMap } from 'automapper-classes';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export enum NOI_SUBMISSION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  SUBMITTED_TO_ALC_INCOMPLETE = 'SUIN', //Submitted to ALC - Incomplete
  RECEIVED_BY_ALC = 'RECA', //Received By ALC
  ALC_DECISION = 'ALCD', //Decision Released
  CANCELLED = 'CANC',
}

export class NoticeOfIntentStatusDto extends BaseCodeDto {
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

export class NoticeOfIntentSubmissionToSubmissionStatusDto {
  @AutoMap()
  submissionUuid: string;

  @AutoMap()
  effectiveDate: number;

  @AutoMap()
  statusTypeCode: string;

  @AutoMap(() => NoticeOfIntentStatusDto)
  status: NoticeOfIntentStatusDto;
}
