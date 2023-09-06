import { AutoMap } from '@automapper/classes';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export enum NOTIFICATION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  ALC_RESPONSE_SENT = 'ALCR', //Response sent to applicant
  CANCELLED = 'CANC',
}

export class NotificationStatusDto extends BaseCodeDto {
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

export class NotificationSubmissionToSubmissionStatusDto {
  @AutoMap()
  submissionUuid: string;

  @AutoMap()
  effectiveDate: number;

  @AutoMap()
  statusTypeCode: string;

  @AutoMap(() => NotificationStatusDto)
  status: NotificationStatusDto;
}
