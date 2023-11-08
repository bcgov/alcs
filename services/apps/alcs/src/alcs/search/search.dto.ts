import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';

export class SearchResultDto {
  type: string;
  referenceId: string;
  applicant?: string;
  localGovernmentName: string | undefined;
  fileNumber: string;
  boardCode?: string;
  label?: ApplicationTypeDto;
  outcome?: string
}

export type SearchEntityClass = 'APP' | 'NOI' | 'PLAN' | 'COV' | 'NOTI';

export class ApplicationSearchResultDto {
  type: ApplicationTypeDto;
  referenceId: string;
  ownerName?: string;
  localGovernmentName?: string;
  fileNumber: string;
  boardCode?: string;
  status: string;
  dateSubmitted?: number;
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
  class: SearchEntityClass;
}

export class NonApplicationSearchResultDto {
  type: string | null;
  applicant: string | null;
  referenceId: string | null;
  localGovernmentName: string | null;
  fileNumber: string;
  boardCode: string | null;
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
  class: SearchEntityClass;
}

export class AdvancedSearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  nonApplications: NonApplicationSearchResultDto[];
  notifications: NotificationSearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalNonApplications: number;
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
  legacyId?: string;

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

  @IsNumber()
  @IsOptional()
  resolutionNumber?: number;

  @IsNumber()
  @IsOptional()
  resolutionYear?: number;

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
  dateSubmittedFrom?: number;

  @IsNumber()
  @IsOptional()
  dateSubmittedTo?: number;

  @IsNumber()
  @IsOptional()
  dateDecidedFrom?: number;

  @IsNumber()
  @IsOptional()
  dateDecidedTo?: number;

  @IsArray()
  fileTypes: string[];
}
