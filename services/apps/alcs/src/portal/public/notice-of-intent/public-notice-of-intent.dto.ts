import { AutoMap } from '@automapper/classes';
import { NoticeOfIntentStatusDto } from '../../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { ProposedStructure } from '../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { PublicOwnerDto } from '../public.dto';

export class PublicNoticeOfIntentSubmissionDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  uuid: string;

  @AutoMap()
  createdAt: number;

  @AutoMap()
  updatedAt: number;

  @AutoMap()
  applicant: string;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap(() => Boolean)
  hasOtherParcelsInCommunity?: boolean | null;

  lastStatusUpdate: number;

  status: NoticeOfIntentStatusDto;

  @AutoMap(() => [PublicOwnerDto])
  owners: PublicOwnerDto[];

  type: string;

  @AutoMap()
  typeCode: string;

  @AutoMap(() => String)
  purpose: string | null;

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

  @AutoMap(() => String)
  primaryContactOwnerUuid?: string | null;

  //Soil Fields
  @AutoMap(() => Boolean)
  soilIsFollowUp: boolean | null;

  @AutoMap(() => String)
  soilFollowUpIDs: string | null;

  @AutoMap(() => String)
  soilTypeRemoved: string | null;

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

  @AutoMap(() => Number)
  fillProjectDurationAmount: number | null;

  @AutoMap(() => String)
  fillProjectDurationUnit?: string | null;

  @AutoMap(() => String)
  soilFillTypeToPlace?: string | null;

  @AutoMap(() => Boolean)
  soilIsExtractionOrMining?: boolean;

  @AutoMap(() => Boolean)
  soilIsAreaWideFilling?: boolean;

  @AutoMap(() => Boolean)
  soilHasSubmittedNotice?: boolean;

  @AutoMap(() => Boolean)
  soilIsRemovingSoilForNewStructure?: boolean;

  @AutoMap(() => String)
  soilStructureFarmUseReason?: string | null;

  @AutoMap(() => String)
  soilStructureResidentialUseReason?: string | null;

  @AutoMap(() => String)
  soilAgriParcelActivity?: string | null;

  @AutoMap(() => String)
  soilStructureResidentialAccessoryUseReason?: string | null;

  @AutoMap(() => String)
  soilStructureOtherUseReason?: string | null;

  @AutoMap(() => [ProposedStructure])
  soilProposedStructures: ProposedStructure[];
}
