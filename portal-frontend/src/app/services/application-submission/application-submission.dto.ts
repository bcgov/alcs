import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationOwnerDetailedDto } from '../application-owner/application-owner.dto';

export enum APPLICATION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM',
  SUBMITTED_TO_LG = 'SUBG',
  IN_REVIEW = 'REVW',
  REFUSED_TO_FORWARD = 'REFU',
  INCOMPLETE = 'INCM',
  WRONG_GOV = 'WRNG',
  CANCELLED = 'CANC',
}

export interface ApplicationStatusDto extends BaseCodeDto {}

export interface ApplicationSubmissionDto {
  fileNumber: string;
  createdAt: string;
  updatedAt: string;
  lastStatusUpdate: number;
  applicant: string;
  type: string;
  typeCode: string;
  localGovernmentUuid: string;
  status: ApplicationStatusDto;
  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
  owners: ApplicationOwnerDetailedDto[];
  hasOtherParcelsInCommunity?: boolean | null;
  returnedComment?: string;
}

export interface ApplicationSubmissionDetailedDto extends ApplicationSubmissionDto {
  primaryContactOwnerUuid?: string;

  parcelsAgricultureDescription?: string | null;
  parcelsAgricultureImprovementDescription?: string | null;
  parcelsNonAgricultureUseDescription?: string | null;
  northLandUseType?: string | null;
  northLandUseTypeDescription?: string | null;
  eastLandUseType?: string | null;
  eastLandUseTypeDescription?: string | null;
  southLandUseType?: string | null;
  southLandUseTypeDescription?: string | null;
  westLandUseType?: string | null;
  westLandUseTypeDescription?: string | null;

  //NFU Specific Fields
  nfuHectares: number | null;
  nfuPurpose: string | null;
  nfuOutsideLands: string | null;
  nfuAgricultureSupport: string | null;
  nfuWillImportFill: boolean | null;
  nfuTotalFillPlacement: number | null;
  nfuMaxFillDepth: number | null;
  nfuFillVolume: number | null;
  nfuProjectDurationAmount: number | null;
  nfuProjectDurationUnit: string | null;
  nfuFillTypeDescription: string | null;
  nfuFillOriginDescription: string | null;

  //TUR Fields
  turPurpose: string | null;
  turAgriculturalActivities: string | null;
  turReduceNegativeImpacts: string | null;
  turOutsideLands: string | null;
  turTotalCorridorArea: number | null;
  turAllOwnersNotified?: boolean | null;
}

export interface ApplicationSubmissionUpdateDto {
  applicant?: string;
  localGovernmentUuid?: string;
  typeCode?: string;
  primaryContactOwnerUuid?: string;
  hasOtherParcelsInCommunity?: boolean | null;

  //Land use fields
  parcelsAgricultureDescription?: string | null;
  parcelsAgricultureImprovementDescription?: string | null;
  parcelsNonAgricultureUseDescription?: string | null;
  northLandUseType?: string | null;
  northLandUseTypeDescription?: string | null;
  eastLandUseType?: string | null;
  eastLandUseTypeDescription?: string | null;
  southLandUseType?: string | null;
  southLandUseTypeDescription?: string | null;
  westLandUseType?: string | null;
  westLandUseTypeDescription?: string | null;

  //NFU Specific Fields
  nfuHectares?: number | null;
  nfuPurpose?: string | null;
  nfuOutsideLands?: string | null;
  nfuAgricultureSupport?: string | null;
  nfuWillImportFill?: boolean | null;
  nfuTotalFillPlacement?: number | null;
  nfuMaxFillDepth?: number | null;
  nfuFillVolume?: number | null;
  nfuProjectDurationAmount?: number | null;
  nfuProjectDurationUnit?: string | null;
  nfuFillTypeDescription?: string | null;
  nfuFillOriginDescription?: string | null;

  //TUR Fields
  turPurpose?: string | null;
  turAgriculturalActivities?: string | null;
  turReduceNegativeImpacts?: string | null;
  turOutsideLands?: string | null;
  turTotalCorridorArea?: number | null;
  turAllOwnersNotified?: boolean | null;
}
