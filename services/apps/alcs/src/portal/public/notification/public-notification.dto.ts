import { AutoMap } from 'automapper-classes';
import { NotificationStatusDto } from '../../../alcs/notification/notification-submission-status/notification-status.dto';
import { PublicOwnerDto } from '../public.dto';

export class PublicNotificationSubmissionDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  uuid: string;

  @AutoMap()
  createdAt: number;

  updatedAt: number;

  @AutoMap()
  applicant: string;

  @AutoMap(() => String)
  contactFirstName: string | null;

  @AutoMap(() => String)
  contactLastName: string | null;

  @AutoMap(() => String)
  contactOrganization: string | null;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap()
  type: string;

  @AutoMap()
  typeCode: string;

  status: NotificationStatusDto;
  lastStatusUpdate: number;

  @AutoMap(() => [PublicOwnerDto])
  transferees: PublicOwnerDto[];

  @AutoMap(() => String)
  submittersFileNumber: string | null;

  @AutoMap(() => String)
  purpose: string | null;

  @AutoMap(() => Number)
  totalArea: number | null;

  @AutoMap(() => Boolean)
  hasSurveyPlan: boolean | null;
}
