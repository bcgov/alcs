import { NoticeOfIntentPortalDecisionDto } from '../notice-of-intent-decision/notice-of-intent-decision.dto';
import {
  NoticeOfIntentSubmissionStatusDto,
  ProposedStructure,
} from '../notice-of-intent-submission/notice-of-intent-submission.dto';
import { PublicDocumentDto, PublicOwnerDto, PublicParcelDto } from './public.dto';

export interface GetPublicNoticeOfIntentResponseDto {
  submission: PublicNoticeOfIntentSubmissionDto;
  parcels: PublicParcelDto[];
  documents: PublicDocumentDto[];
  decisions: NoticeOfIntentPortalDecisionDto[];
}

export interface PublicNoticeOfIntentSubmissionDto {
  fileNumber: string;
  uuid: string;
  createdAt: number;
  updatedAt: number;
  applicant: string;
  localGovernmentUuid: string;
  hasOtherParcelsInCommunity?: boolean | null;
  lastStatusUpdate: number;
  status: NoticeOfIntentSubmissionStatusDto;
  owners: PublicOwnerDto[];
  type: string;
  typeCode: string;
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
  primaryContactOwnerUuid?: string | null;

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
  soilProjectDurationAmount: number | null;
  soilProjectDurationUnit?: string | null;
  soilFillTypeToPlace?: string | null;
  soilIsExtractionOrMining?: boolean;
  soilIsAreaWideFilling?: boolean;
  soilHasSubmittedNotice?: boolean;
  soilIsRemovingSoilForNewStructure?: boolean;
  soilStructureFarmUseReason?: string | null;
  soilStructureResidentialUseReason?: string | null;
  soilAgriParcelActivity?: string | null;
  soilStructureResidentialAccessoryUseReason?: string | null;
  soilStructureOtherUseReason?: string | null;
  soilProposedStructures: ProposedStructure[];
}
