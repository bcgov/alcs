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
  localGovernmentName: string;
  fileNumber: string;
  boardCode?: string;
  label?: ApplicationTypeDto;
}

export type SearchEntityClass = 'APP' | 'NOI' | 'PLAN' | 'COV';

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

export class AdvancedSearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  nonApplications: NonApplicationSearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalNonApplications: number;
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
  @MinLength(3)
  fileNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
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

  @IsBoolean()
  @IsOptional()
  isIncludeOtherParcels = false;

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
  applicationFileTypes: string[];
}

export class NonApplicationsSearchRequestDto extends PagingRequestDto {
  @IsString()
  @IsOptional()
  fileNumber?: string;

  @IsString()
  @IsOptional()
  governmentName?: string;

  @IsString()
  @IsOptional()
  regionCode?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
