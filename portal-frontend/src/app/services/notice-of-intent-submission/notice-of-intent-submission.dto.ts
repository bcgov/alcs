import { STRUCTURE_TYPES, TypeOption } from '../../features/notice-of-intents/edit-submission/additional-information/additional-information.component';
import { BaseCodeDto } from '../../shared/dto/base.dto';
import { NoticeOfIntentOwnerDto } from '../notice-of-intent-owner/notice-of-intent-owner.dto';

export enum NOI_SUBMISSION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  SUBMITTED_TO_ALC_INCOMPLETE = 'SUIN', //Submitted to ALC - Incomplete
  RECEIVED_BY_ALC = 'RECA', //Received By ALC
  ALC_DECISION = 'ALCD', //Decision Released
  CANCELLED = 'CANC',
}

export interface NoticeOfIntentSubmissionStatusDto extends BaseCodeDto {
  code: NOI_SUBMISSION_STATUS;
  portalBackgroundColor: string;
  portalColor: string;
}

export interface NoticeOfIntentSubmissionToSubmissionStatusDto {
  submissionUuid: string;
  effectiveDate: number | null;
  statusTypeCode: string;
  status: NoticeOfIntentSubmissionStatusDto;
}

export interface NoticeOfIntentSubmissionDto {
  fileNumber: string;
  uuid: string;
  createdAt: number;
  updatedAt: number;
  applicant: string;
  localGovernmentUuid: string;
  type: string;
  typeCode: string;
  status: NoticeOfIntentSubmissionStatusDto;
  lastStatusUpdate: number;
  submissionStatuses: NoticeOfIntentSubmissionToSubmissionStatusDto[];
  owners: NoticeOfIntentOwnerDto[];
  canEdit: boolean;
  canView: boolean;
}

export interface NoticeOfIntentSubmissionDetailedDto extends NoticeOfIntentSubmissionDto {
  purpose: string | null;
  parcelsAgricultureDescription: string;
  parcelsAgricultureImprovementDescription: string;
  parcelsNonAgricultureUseDescription: string;
  northLandUseType: string;
  northLandUseTypeDescription: string;
  eastLandUseType: string;
  eastLandUseTypeDescription: string;
  southLandUseType: string;
  southLandUseTypeDescription: string;
  westLandUseType: string;
  westLandUseTypeDescription: string;
  primaryContactOwnerUuid: string | null;

  //Soil Fields
  soilIsFollowUp: boolean | null;
  soilFollowUpIDs: string | null;
  soilTypeRemoved: string | null;
  soilToRemoveVolume: number | null;
  soilToRemoveArea: number | null;
  soilToRemoveMaximumDepth: number | null;
  soilToRemoveAverageDepth: number | null;
  soilAlreadyRemovedVolume: number | null;
  soilAlreadyRemovedArea: number | null;
  soilAlreadyRemovedMaximumDepth: number | null;
  soilAlreadyRemovedAverageDepth: number | null;
  soilToPlaceVolume: number | null;
  soilToPlaceArea: number | null;
  soilToPlaceMaximumDepth: number | null;
  soilToPlaceAverageDepth: number | null;
  soilAlreadyPlacedVolume: number | null;
  soilAlreadyPlacedArea: number | null;
  soilAlreadyPlacedMaximumDepth: number | null;
  soilAlreadyPlacedAverageDepth: number | null;
  soilProjectDuration: string | null;
  fillProjectDuration: string | null;
  soilFillTypeToPlace: string | null;
  soilIsExtractionOrMining: boolean | null;
  soilIsAreaWideFilling: boolean | null;
  soilHasSubmittedNotice: boolean | null;
  soilIsRemovingSoilForNewStructure: boolean | null;
  soilStructureFarmUseReason: string | null;
  soilStructureResidentialUseReason: string | null;
  soilAgriParcelActivity: string | null;
  soilStructureResidentialAccessoryUseReason: string | null;
  soilStructureOtherUseReason: string | null;
  soilProposedStructures: ProposedStructure[];
}

export interface NoticeOfIntentSubmissionUpdateDto {
  applicant?: string | null;
  purpose?: string | null;
  localGovernmentUuid?: string | null;
  typeCode?: string | null;
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

  //Soil Fields
  soilIsFollowUp?: boolean | null;
  soilFollowUpIDs?: string | null;
  soilTypeRemoved?: string | null;
  soilToRemoveVolume?: number | null;
  soilToRemoveArea?: number | null;
  soilToRemoveMaximumDepth?: number | null;
  soilToRemoveAverageDepth?: number | null;
  soilAlreadyRemovedVolume?: number | null;
  soilAlreadyRemovedArea?: number | null;
  soilAlreadyRemovedMaximumDepth?: number | null;
  soilAlreadyRemovedAverageDepth?: number | null;
  soilToPlaceVolume?: number | null;
  soilToPlaceArea?: number | null;
  soilToPlaceMaximumDepth?: number | null;
  soilToPlaceAverageDepth?: number | null;
  soilAlreadyPlacedVolume?: number | null;
  soilAlreadyPlacedArea?: number | null;
  soilAlreadyPlacedMaximumDepth?: number | null;
  soilAlreadyPlacedAverageDepth?: number | null;
  soilProjectDuration?: string | null;
  fillProjectDuration?: string | null;
  soilFillTypeToPlace?: string | null;
  soilIsExtractionOrMining?: boolean | null;
  soilIsAreaWideFilling?: boolean | null;
  soilHasSubmittedNotice?: boolean | null;
  soilIsRemovingSoilForNewStructure?: boolean | null;
  soilStructureFarmUseReason?: string | null;
  soilStructureResidentialUseReason?: string | null;
  soilAgriParcelActivity?: string | null;
  soilStructureResidentialAccessoryUseReason?: string | null;
  soilStructureOtherUseReason?: string | null;
  soilProposedStructures?: ProposedStructure[];
}

export interface ProposedStructure {
  type: STRUCTURE_TYPES | null;
  area: number | null;
  options?: TypeOption[];
}
