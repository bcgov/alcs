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

export interface ApplicationDto {
  fileNumber: string;
  createdAt: string;
  updatedAt: string;
  lastStatusUpdate: number;
  applicant: string;
  type: string;
  localGovernmentUuid: string;
  status: ApplicationStatusDto;
  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
  documents: ApplicationDocumentDto[];
  owners: ApplicationOwnerDetailedDto[];
  hasOtherParcelsInCommunity?: boolean | null;
  returnedComment?: string;
}

export interface ApplicationDetailedDto extends ApplicationDto {
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
}

export interface ApplicationUpdateDto {
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
}
