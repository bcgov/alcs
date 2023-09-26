import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApplicationTypeDto } from '../../code/code.dto';

export type SearchEntityClass = 'APP' | 'NOI' | 'NOTI';

export class ApplicationSearchResultDto {
  type: ApplicationTypeDto;
  referenceId: string;
  ownerName?: string;
  localGovernmentName?: string;
  fileNumber: string;
  boardCode?: string;
  status: string;
  dateSubmitted?: number;
  lastUpdate?: number;
  class: SearchEntityClass;
}

export class NoticeOfIntentSearchResultDto {
  type: ApplicationTypeDto;
  referenceId: string;
  ownerName?: string;
  localGovernmentName?: string;
  fileNumber: string;
  boardCode?: string;
  status: string;
  dateSubmitted?: number;
  lastUpdate?: number;
  class: SearchEntityClass;
}

export class NotificationSearchResultDto {
  type: ApplicationTypeDto;
  referenceId: string;
  ownerName?: string;
  localGovernmentName?: string;
  fileNumber: string;
  boardCode?: string;
  status: string;
  dateSubmitted?: number;
  lastUpdate?: number;
  class: SearchEntityClass;
}

export class AdvancedSearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  notifications: NotificationSearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalNotifications: number;
}

export class AdvancedSearchResultDto<T> {
  data: T;
  total: number;
}

export class PagingRequestDto {
  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsString()
  sortField: string;

  @IsString()
  sortDirection: 'ASC' | 'DESC';
}

export class SearchRequestDto extends PagingRequestDto {
  @IsString()
  @IsOptional()
  fileNumber?: string;

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

  @IsString()
  @IsOptional()
  portalStatusCode?: string;

  @IsString()
  @IsOptional()
  governmentName?: string;

  @IsString()
  @IsOptional()
  regionCode?: string;

  @IsNumber()
  @IsOptional()
  dateDecidedFrom?: number;

  @IsNumber()
  @IsOptional()
  dateDecidedTo?: number;

  @IsArray()
  fileTypes: string[];
}

// typeorm does not transform property names for the status
export class LinkedStatusType {
  submission_uuid: string;
  status_type_code: string;
  effective_date: Date;
  label: string;
}
