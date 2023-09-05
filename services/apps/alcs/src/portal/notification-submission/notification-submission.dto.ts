import { AutoMap } from '@automapper/classes';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { NoticeOfIntentStatusDto } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NotificationTransfereeDto } from './notification-transferee/notification-transferee.dto';

export const MAX_DESCRIPTION_FIELD_LENGTH = 4000;

export class NotificationSubmissionDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  uuid: string;

  @AutoMap()
  createdAt: number;

  @AutoMap()
  updatedAt: number;

  @AutoMap()
  applicant: string;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap()
  type: string;

  @AutoMap()
  typeCode: string;

  status: NoticeOfIntentStatusDto;
  lastStatusUpdate: number;
  owners: NotificationTransfereeDto[];

  canEdit: boolean;
  canView: boolean;
}

export class NotificationSubmissionDetailedDto extends NotificationSubmissionDto {
  @AutoMap(() => String)
  purpose: string | null;
}

export class NotificationSubmissionUpdateDto {
  @IsString()
  @IsOptional()
  applicant?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  purpose?: string;

  @IsUUID()
  @IsOptional()
  localGovernmentUuid?: string;
}
