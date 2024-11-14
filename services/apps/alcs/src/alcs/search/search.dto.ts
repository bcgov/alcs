import { IsArray, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { InquiryTypeDto } from '../inquiry/inquiry.dto';
import { PlanningReviewTypeDto } from '../planning-review/planning-review.dto';

export class SearchResultDto {
  type: string;
  referenceId: string;
  applicant?: string;
  localGovernmentName: string | undefined;
  fileNumber: string;
  boardCode?: string;
  label?: ApplicationTypeDto;
}

export type SearchEntityClass = 'APP' | 'NOI' | 'PLAN' | 'COV' | 'NOTI' | 'INQR';

export class ApplicationSearchResultDto {
  type: ApplicationTypeDto;
  referenceId: string;
  ownerName?: string;
  localGovernmentName?: string;
  fileNumber: string;
  boardCode?: string;
  status?: string | null;
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
  status?: string | null;
  dateSubmitted?: number;
  class: SearchEntityClass;
}

export class PlanningReviewSearchResultDto {
  type: PlanningReviewTypeDto | null;
  documentName: string | null;
  referenceId: string | null;
  localGovernmentName: string | null;
  dateSubmitted: number;
  fileNumber: string;
  class: SearchEntityClass;
  open: boolean;
}

export class NotificationSearchResultDto {
  type: ApplicationTypeDto;
  referenceId: string;
  ownerName?: string;
  localGovernmentName?: string;
  fileNumber: string;
  boardCode?: string;
  status?: string | null;
  dateSubmitted?: number;
  class: SearchEntityClass;
}

export class InquirySearchResultDto {
  type: InquiryTypeDto;
  inquirerFirstName?: string;
  inquirerLastName?: string;
  inquirerOrganizationName?: string;
  localGovernmentName: string | null;
  fileNumber: string;
  boardCode?: string;
  dateSubmitted?: number;
  class: SearchEntityClass;
  open: boolean;
}

export class AdvancedSearchResponseDto {
  applications: ApplicationSearchResultDto[];
  noticeOfIntents: NoticeOfIntentSearchResultDto[];
  notifications: NotificationSearchResultDto[];
  planningReviews: PlanningReviewSearchResultDto[];
  inquiries: InquirySearchResultDto[];
  totalApplications: number;
  totalNoticeOfIntents: number;
  totalPlanningReviews: number;
  totalNotifications: number;
  totalInquiries: number;
}

export class StatusUpdateSearchResultDto {
  fileNumber: string;
  status: string;
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

  @IsArray()
  portalStatusCodes: string[];

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

  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @IsString()
  @IsOptional()
  tagCategoryId?: string;
}
