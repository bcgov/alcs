import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AllegedActivity, NoticeType } from '../../compliance-and-enforcement.enum';
import { ComplianceAndEnforcementDocumentDto } from '../../document/document.dto';

export enum NotificationMethods {
  EMAIL = 'Email',
  PERSONALLY = 'Personally',
  POSTED_ON_PROPERTY = 'Posted on Property',
  REGISTERED_MAIL = 'Registered Mail',
}

export class NoticeNotification {
  @AutoMap()
  method!: NotificationMethods;

  @AutoMap()
  date!: string | null;
}

export class NoticeDto {
  @AutoMap()
  uuid!: string;

  @AutoMap()
  createdAt!: number;

  @AutoMap()
  isDraft!: boolean;

  @AutoMap()
  date!: string | null;

  @AutoMap()
  type!: NoticeType | null;

  @AutoMap()
  allegedActivity!: AllegedActivity[];

  @AutoMap()
  notifications!: NoticeNotification[];

  @AutoMap()
  documents!: ComplianceAndEnforcementDocumentDto[];

  @AutoMap()
  entryUuid!: string;

  @AutoMap()
  dueDates!: NoticeDueDateDto[];

  @AutoMap()
  issuedToIndividualResponsiblePartyUuid!: string | null;

  @AutoMap()
  issuedToDirectorUuid!: string | null;
}

export class UpdateNoticeDto {
  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @AutoMap()
  @IsOptional()
  @IsDateString()
  date?: string | null;

  @AutoMap()
  @IsOptional()
  @IsString()
  type?: NoticeType | null;

  @AutoMap()
  @IsOptional()
  allegedActivity?: AllegedActivity[];

  @AutoMap()
  @IsOptional()
  notifications?: NoticeNotification[];

  @AutoMap()
  @IsOptional()
  @IsString()
  entryUuid?: string;

  @AutoMap()
  @ValidateNested({ each: true })
  @Type(() => UpdateNoticeDueDateDto)
  dueDates?: UpdateNoticeDueDateDto[];

  @AutoMap()
  @IsOptional()
  @IsString()
  issuedToIndividualResponsiblePartyUuid?: string | null;

  @AutoMap()
  @IsOptional()
  @IsString()
  issuedToDirectorUuid?: string | null;
}

export class NoticeDueDateDto {
  @AutoMap()
  uuid!: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  date!: string;

  @AutoMap()
  completedDate!: number | null;

  @AutoMap()
  comment!: string;
}

export class UpdateNoticeDueDateDto {
  @AutoMap()
  @IsOptional()
  @IsString()
  uuid?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  noticeUuid?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  date?: string;

  @AutoMap()
  @IsOptional()
  @IsNumber()
  completedDate?: number | null;

  @AutoMap()
  @IsOptional()
  @IsString()
  comment?: string;
}
