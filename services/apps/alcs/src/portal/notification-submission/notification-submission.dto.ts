import { AutoMap } from '@automapper/classes';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Column } from 'typeorm';
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

  @AutoMap(() => String)
  contactFirstName: string | null;

  @AutoMap(() => String)
  contactLastName: string | null;

  @AutoMap(() => String)
  contactOrganization: string | null;

  @AutoMap(() => String)
  contactPhone: string | null;

  @AutoMap(() => String)
  contactEmail: string | null;

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
  submittersFileNumber: string | null;

  @AutoMap(() => String)
  purpose: string | null;

  @AutoMap(() => Number)
  totalArea: number | null;

  @AutoMap(() => Boolean)
  hasSurveyPlan: boolean | null;
}

export class NotificationSubmissionUpdateDto {
  @IsString()
  @IsOptional()
  applicant?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  purpose?: string;

  @IsString()
  @IsOptional()
  submittersFileNumber?: string | null;

  @IsNumber()
  @IsOptional()
  totalArea?: number | null;

  @IsBoolean()
  @IsOptional()
  hasSurveyPlan?: boolean | null;

  @IsUUID()
  @IsOptional()
  localGovernmentUuid?: string;

  @IsString()
  @IsOptional()
  contactFirstName?: string | null;

  @IsString()
  @IsOptional()
  contactLastName?: string | null;

  @IsString()
  @IsOptional()
  contactOrganization?: string | null;

  @IsString()
  @IsOptional()
  contactPhone?: string | null;

  @IsString()
  @IsOptional()
  contactEmail?: string | null;
}
