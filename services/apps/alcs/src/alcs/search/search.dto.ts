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

export type SearchEntityClass = 'APP' | 'NOI' | 'PLN' | 'COV';

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

export class PlanningReviewSearchResultDto {
  type: string;
  referenceId: string;
  localGovernmentName?: string;
  fileNumber: string;
  boardCode?: string;
  class: SearchEntityClass;
}

export class CovenantSearchResultDto {
  ownerName?: string;
  referenceId: string;
  localGovernmentName?: string;
  fileNumber: string;
  boardCode?: string;
  class: SearchEntityClass;
}

export class AdvancedSearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  planningReviews: PlanningReviewSearchResultDto[];
  covenants: CovenantSearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalPlanningReviews: number;
  totalCovenants: number;
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

export class PlanningReviewSearchRequestDto extends PagingRequestDto {
  fileNumber?: string;

  governmentName?: string;

  regionCode?: string;
}

export class CovenantSearchRequestDto extends PagingRequestDto {
  fileNumber?: string;

  name?: string;

  governmentName?: string;

  regionCode?: string;
}
