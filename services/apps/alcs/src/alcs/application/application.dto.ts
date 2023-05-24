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
import { ApplicationOwnerDto } from '../../portal/application-submission/application-owner/application-owner.dto';
import { ApplicationParcelDto } from '../../portal/application-submission/application-parcel/application-parcel.dto';
import { ProposedLot } from '../../portal/application-submission/application-submission.entity';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { ApplicationDecisionMeetingDto } from '../decision/decision-v1/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationLocalGovernmentDto } from './application-code/application-local-government/application-local-government.dto';
import { ApplicationDocumentDto } from './application-document/application-document.dto';
import { StatusHistory } from './application.entity';

export class SubmittedApplicationDto {
  @AutoMap(() => [ApplicationParcelDto])
  parcels: ApplicationParcelDto[];

  @AutoMap(() => Boolean)
  hasOtherParcelsInCommunity?: boolean | null;

  @AutoMap(() => [ApplicationParcelDto])
  otherParcels: ApplicationParcelDto[];

  @AutoMap()
  primaryContact: ApplicationOwnerDto;

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

  //Subdivision Fields
  @AutoMap(() => String)
  subdPurpose?: string | null;

  @AutoMap(() => String)
  subdSuitability?: string | null;

  @AutoMap(() => String)
  subdAgricultureSupport?: string | null;

  @AutoMap(() => Boolean)
  subdIsHomeSiteSeverance?: boolean | null;

  subdProposedLots?: ProposedLot[];

  //Soil Fields
  @AutoMap(() => Boolean)
  soilIsNOIFollowUp: boolean | null;

  @AutoMap(() => String)
  soilNOIIDs: string | null;

  @AutoMap(() => Boolean)
  soilHasPreviousALCAuthorization: boolean | null;

  @AutoMap(() => String)
  soilApplicationIDs: string | null;

  @AutoMap(() => String)
  soilPurpose: string | null;

  @AutoMap(() => String)
  soilTypeRemoved: string | null;

  @AutoMap(() => String)
  soilReduceNegativeImpacts: string | null;

  @AutoMap(() => Number)
  soilToRemoveVolume: number | null;

  @AutoMap(() => Number)
  soilToRemoveArea: number | null;

  @AutoMap(() => Number)
  soilToRemoveMaximumDepth: number | null;

  @AutoMap(() => Number)
  soilToRemoveAverageDepth: number | null;

  @AutoMap(() => Number)
  soilAlreadyRemovedVolume: number | null;

  @AutoMap(() => Number)
  soilAlreadyRemovedArea: number | null;

  @AutoMap(() => Number)
  soilAlreadyRemovedMaximumDepth: number | null;

  @AutoMap(() => Number)
  soilAlreadyRemovedAverageDepth: number | null;

  @AutoMap(() => Number)
  soilToPlaceVolume: number | null;

  @AutoMap(() => Number)
  soilToPlaceArea: number | null;

  @AutoMap(() => Number)
  soilToPlaceMaximumDepth: number | null;

  @AutoMap(() => Number)
  soilToPlaceAverageDepth: number | null;

  @AutoMap(() => Number)
  soilAlreadyPlacedVolume: number | null;

  @AutoMap(() => Number)
  soilAlreadyPlacedArea: number | null;

  @AutoMap(() => Number)
  soilAlreadyPlacedMaximumDepth: number | null;

  @AutoMap(() => Number)
  soilAlreadyPlacedAverageDepth: number | null;

  @AutoMap(() => Number)
  soilProjectDurationAmount: number | null;

  @AutoMap(() => String)
  soilProjectDurationUnit?: string | null;

  @AutoMap(() => String)
  soilFillTypeToPlace?: string;

  @AutoMap(() => String)
  soilAlternativeMeasures?: string;

  @AutoMap(() => Boolean)
  soilIsExtractionOrMining?: boolean;

  @AutoMap(() => Boolean)
  soilHasSubmittedNotice?: boolean;

  @AutoMap()
  typeCode: string;
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

  @IsOptional()
  @IsNumber()
  alrArea?: number;

  @IsOptional()
  @IsString()
  agCap?: string;

  @IsOptional()
  @IsString()
  agCapSource?: string;

  @IsOptional()
  @IsString()
  agCapMap?: string;

  @IsOptional()
  @IsString()
  agCapConsultant?: string;

  @IsOptional()
  @IsString()
  nfuUseType?: string;

  @IsOptional()
  @IsString()
  nfuUseSubType?: string;

  @IsOptional()
  @IsNumber()
  nfuEndDate?: number;
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
  @Type(() => SubmittedApplicationDto)
  submittedApplication?: SubmittedApplicationDto;

  @AutoMap()
  source: 'ALCS' | 'APPLICANT';

  @AutoMap(() => Number)
  alrArea?: number;

  @AutoMap(() => String)
  agCap?: string;

  @AutoMap(() => String)
  agCapSource?: string;

  @AutoMap(() => String)
  agCapMap?: string;

  @AutoMap(() => String)
  agCapConsultant?: string;

  @AutoMap(() => String)
  nfuUseType?: string;

  @AutoMap(() => String)
  nfuUseSubType?: string;
  nfuEndDate?: number;
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
  alrArea?: number;
  agCap?: string;
  agCapSource?: string;
  agCapMap?: string;
  agCapConsultant?: string;
  nfuUseType?: string;
  nfuUseSubType?: string;
  nfuEndDate?: Date | null;
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
