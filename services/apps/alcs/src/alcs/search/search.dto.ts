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

export class ApplicationSearchResultDto {
  type: ApplicationTypeDto;
  referenceId: string;
  ownerName?: string;
  localGovernmentName: string;
  fileNumber: string;
  boardCode?: string;
  status: string;
}

export class NoticeOfIntentSearchResultDto {
  type: ApplicationTypeDto;
  referenceId: string;
  ownerName?: string;
  localGovernmentName: string;
  fileNumber: string;
  boardCode?: string;
  status: string;
}

export class AdvancedSearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
}

export class AdvancedSearchResultDto<T> {
  // data:
  //   | ApplicationSubmissionSearchView[]
  //   | NoticeOfIntentSubmissionSearchView[];
  data: T;
  total: number;
}

export class SearchRequestDto {
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

  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsString()
  sortField: string;

  @IsString()
  sortDirection: 'ASC' | 'DESC';
}
