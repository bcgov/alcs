import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';
import { PagingRequestDto } from '../public/search/public-search.dto';

export type SearchEntityClass = 'APP' | 'NOI' | 'NOTI';

export class BaseInboxResultDto {
  type: string;
  referenceId: string;
  ownerName?: string;
  localGovernmentName?: string;
  fileNumber: string;
  status: string;
  createdAt?: number;
  lastUpdate?: number;
  class: SearchEntityClass;
}

export class ApplicationInboxResultDto extends BaseInboxResultDto {}
export class NoticeOfIntentInboxResultDto extends BaseInboxResultDto {}
export class NotificationInboxResultDto extends BaseInboxResultDto {}

export class InboxResponseDto {
  applications: ApplicationInboxResultDto[];
  noticeOfIntents: NoticeOfIntentInboxResultDto[];
  notifications: NotificationInboxResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalNotifications: number;
}

export class AdvancedSearchResultDto<T> {
  data: T;
  total: number;
}

export class InboxRequestDto extends PagingRequestDto {
  @IsString()
  @IsOptional()
  fileNumber?: string;

  @IsString()
  @IsOptional()
  createdByGovernment?: boolean;

  @IsString()
  @IsOptional()
  submittedToGovernment?: boolean;

  @IsString()
  @IsOptional()
  governmentFileNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
  pid?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  civicAddress?: string;

  @IsArray()
  @IsOptional()
  portalStatusCodes?: string[];

  @IsArray()
  fileTypes: string[];
}

// typeorm does not transform property names for the status
export class LinkedStatusType {
  submission_uuid: string;
  status_type_code: string;
  effective_date: number;
  label: string;
}
