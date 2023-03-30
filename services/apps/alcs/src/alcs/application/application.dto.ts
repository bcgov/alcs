import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApplicationSubmissionReviewDto } from '../../portal/application-submission-review/application-submission-review.dto';
import { ApplicationParcelDocumentDto } from '../../portal/application-submission/application-parcel/application-parcel-document/application-parcel-document.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { ApplicationDecisionMeetingDto } from '../decision/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationLocalGovernmentDto } from './application-code/application-local-government/application-local-government.dto';
import { ApplicationDocumentDto } from './application-document/application-document.dto';
import { StatusHistory } from './application.entity';

export class ApplicationReviewDto {
  @AutoMap()
  localGovernmentFileNumber: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  position: string;

  @AutoMap()
  department: string;

  @AutoMap()
  phoneNumber: string;

  @AutoMap()
  email: string;

  @AutoMap(() => Boolean)
  isOCPDesignation: boolean | null;

  @AutoMap(() => String)
  OCPBylawName: string | null;

  @AutoMap(() => String)
  OCPDesignation: string | null;

  @AutoMap(() => Boolean)
  OCPConsistent: boolean | null;

  @AutoMap(() => Boolean)
  isSubjectToZoning: boolean | null;

  @AutoMap(() => String)
  zoningBylawName: string | null;

  @AutoMap(() => String)
  zoningDesignation: string | null;

  @AutoMap(() => String)
  zoningMinimumLotSize: string | null;

  @AutoMap(() => Boolean)
  isZoningConsistent: boolean | null;

  @AutoMap(() => Boolean)
  isAuthorized: boolean | null;
}

export class SubmittedApplicationOwnerDto {
  @AutoMap()
  displayName: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  organizationName?: string;

  @AutoMap()
  phoneNumber: string;

  @AutoMap()
  email: string;

  @AutoMap()
  type: string;

  @AutoMap()
  corporateSummaryDocumentUuid?: string;
}

export class SubmittedApplicationParcelDto {
  @AutoMap()
  pid?: string;

  @AutoMap()
  pin?: string;

  @AutoMap()
  legalDescription: string;

  @AutoMap()
  mapAreaHectares: string;

  @AutoMap()
  purchasedDate?: number;

  @AutoMap()
  isFarm: boolean;

  @AutoMap()
  ownershipType: string;

  @AutoMap()
  crownLandOwnerType: string;

  @AutoMap()
  parcelType: string;

  @AutoMap(() => [SubmittedApplicationOwnerDto])
  owners: SubmittedApplicationOwnerDto[];

  @AutoMap(() => [ApplicationParcelDocumentDto])
  documents: ApplicationParcelDocumentDto[];
}

export class SubmittedApplicationDto {
  @AutoMap(() => [SubmittedApplicationParcelDto])
  parcels: SubmittedApplicationParcelDto[];

  @AutoMap(() => [SubmittedApplicationParcelDto])
  otherParcels: SubmittedApplicationParcelDto[];

  @AutoMap()
  primaryContact: SubmittedApplicationOwnerDto;

  @AutoMap()
  parcelsAgricultureDescription: string;

  @AutoMap()
  parcelsAgricultureImprovementDescription: string;

  @AutoMap()
  parcelsNonAgricultureUseDescription: string;

  @AutoMap()
  northLandUseType: string;

  @AutoMap()
  northLandUseTypeDescription: string;

  @AutoMap()
  eastLandUseType: string;

  @AutoMap()
  eastLandUseTypeDescription: string;

  @AutoMap()
  southLandUseType: string;

  @AutoMap()
  southLandUseTypeDescription: string;

  @AutoMap()
  westLandUseType: string;

  @AutoMap()
  westLandUseTypeDescription: string;

  //NFU Data
  @AutoMap()
  nfuHectares?: string;

  @AutoMap()
  nfuPurpose?: string;

  @AutoMap()
  nfuOutsideLands?: string;

  @AutoMap()
  nfuAgricultureSupport?: string;

  @AutoMap()
  nfuWillImportFill?: boolean;

  @AutoMap()
  nfuTotalFillPlacement?: string;

  @AutoMap()
  nfuMaxFillDepth?: string;

  @AutoMap()
  nfuFillVolume?: string;

  @AutoMap()
  nfuProjectDurationAmount?: string;

  @AutoMap()
  nfuProjectDurationUnit?: string;

  @AutoMap()
  nfuFillTypeDescription?: string;

  @AutoMap()
  nfuFillOriginDescription?: string;

  //TUR Data
  @AutoMap()
  turPurpose?: string;

  @AutoMap()
  turOutsideLands?: string;

  @AutoMap()
  turAgriculturalActivities?: string;

  @AutoMap()
  turReduceNegativeImpacts?: string;

  @AutoMap()
  turTotalCorridorArea?: string;

  @AutoMap(() => [ApplicationDocumentDto])
  documents: ApplicationDocumentDto[];
}

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @IsNotEmpty()
  @IsString()
  applicant: string;

  @IsNotEmpty()
  @IsString()
  typeCode: string;

  @IsNotEmpty()
  @IsNumber()
  dateSubmittedToAlc: number;

  @IsString()
  @IsOptional()
  regionCode?: string;

  @IsNotEmpty()
  @IsString()
  localGovernmentUuid: string;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsNumber()
  dateSubmittedToAlc?: number;

  @IsOptional()
  @IsString()
  applicant?: string;

  @IsOptional()
  @IsString()
  typeCode?: string;

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsString()
  statusCode?: string;

  @IsOptional()
  @IsUUID()
  assigneeUuid?: string;

  @IsBoolean()
  @IsOptional()
  paused?: boolean;

  @IsOptional()
  @IsNumber()
  feePaidDate?: number;

  @IsBoolean()
  @IsOptional()
  feeWaived?: boolean;

  @IsBoolean()
  @IsOptional()
  feeSplitWithLg?: boolean;

  @IsOptional()
  @IsString()
  feeAmount?: string;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedIncomplete?: number;

  @IsOptional()
  @IsNumber()
  dateReceivedAllItems?: number;

  @IsOptional()
  @IsNumber()
  dateAcknowledgedComplete?: number;

  @IsBoolean()
  @IsOptional()
  highPriority?: boolean;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsOptional()
  @IsNumber()
  notificationSentDate?: number;
}

export class ApplicationDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap()
  applicant: string;

  activeDays: number;

  pausedDays: number;

  paused: boolean;

  dateSubmittedToAlc?: number;

  feePaidDate?: number;

  @AutoMap(() => Boolean)
  feeWaived?: boolean;

  @AutoMap(() => Boolean)
  feeSplitWithLg?: boolean;

  @AutoMap(() => String)
  feeAmount?: string;

  dateAcknowledgedIncomplete?: number;

  dateReceivedAllItems?: number;

  dateAcknowledgedComplete?: number;

  decisionDate?: number;

  notificationSentDate?: number;

  @AutoMap(() => ApplicationTypeDto)
  type: ApplicationTypeDto;

  @AutoMap(() => String)
  summary: string | null;

  @AutoMap(() => ApplicationRegionDto)
  region: ApplicationRegionDto;

  @AutoMap(() => ApplicationLocalGovernmentDto)
  localGovernment: ApplicationLocalGovernmentDto;

  @AutoMap(() => ApplicationDecisionMeetingDto)
  decisionMeetings: ApplicationDecisionMeetingDto[];

  @AutoMap(() => [StatusHistory])
  statusHistory?: StatusHistory[];

  @AutoMap()
  @Type(() => CardDto)
  card?: CardDto;

  @AutoMap()
  @Type(() => ApplicationSubmissionReviewDto)
  applicationReview?: ApplicationSubmissionReviewDto;

  @AutoMap()
  @Type(() => SubmittedApplicationDto)
  submittedApplication?: SubmittedApplicationDto;
}

export class ApplicationUpdateServiceDto {
  dateSubmittedToAlc?: Date | null | undefined;
  applicant?: string;
  typeCode?: string;
  regionCode?: string;
  feePaidDate?: Date | null;
  feeWaived?: boolean | undefined | null;
  feeSplitWithLg?: boolean | undefined | null;
  feeAmount?: number | undefined | null;
  dateAcknowledgedIncomplete?: Date | null | undefined;
  dateReceivedAllItems?: Date | null | undefined;
  dateAcknowledgedComplete?: Date | null | undefined;
  decisionDate?: Date | null | undefined;
  summary?: string;
  notificationSentDate?: Date | null;
}

export class CreateApplicationServiceDto {
  fileNumber: string;
  applicant: string;
  typeCode: string;
  dateSubmittedToAlc?: Date | null | undefined;
  regionCode?: string;
  localGovernmentUuid?: string;
  statusHistory?: StatusHistory[];
  source?: 'ALCS' | 'APPLICANT';
}
