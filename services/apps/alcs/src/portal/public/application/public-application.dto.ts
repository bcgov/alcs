import { AutoMap } from 'automapper-classes';
import { ApplicationStatusDto } from '../../../alcs/application/application-submission-status/submission-status.dto';
import { NaruSubtypeDto } from '../../application-submission/application-submission.dto';
import { ProposedLot } from '../../application-submission/application-submission.entity';
import { PublicOwnerDto } from '../public.dto';

export class PublicApplicationSubmissionDto {
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

  status: ApplicationStatusDto;

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

  //NFU Specific Fields
  @AutoMap(() => Number)
  nfuHectares?: number | null;

  @AutoMap(() => String)
  nfuOutsideLands?: string | null;

  @AutoMap(() => String)
  nfuAgricultureSupport?: string | null;

  @AutoMap(() => String)
  nfuWillImportFill?: boolean | null;

  @AutoMap(() => Number)
  nfuTotalFillArea?: number | null;

  @AutoMap(() => Number)
  nfuMaxFillDepth?: number | null;

  @AutoMap(() => Number)
  nfuAverageFillDepth?: number | null;

  @AutoMap(() => Number)
  nfuFillVolume?: number | null;

  @AutoMap(() => String)
  nfuProjectDuration?: string | null;

  @AutoMap(() => String)
  nfuFillTypeDescription?: string | null;

  @AutoMap(() => String)
  nfuFillOriginDescription?: string | null;

  //TUR Fields
  @AutoMap(() => String)
  turAgriculturalActivities?: string | null;

  @AutoMap(() => String)
  turReduceNegativeImpacts?: string | null;

  @AutoMap(() => String)
  turOutsideLands?: string | null;

  @AutoMap(() => Number)
  turTotalCorridorArea?: number | null;

  @AutoMap(() => Boolean)
  turAllOwnersNotified?: boolean | null;

  //Subdivision Fields
  @AutoMap(() => String)
  subdSuitability?: string | null;

  @AutoMap(() => String)
  subdAgricultureSupport?: string | null;

  @AutoMap(() => Boolean)
  subdIsHomeSiteSeverance?: boolean | null;

  @AutoMap(() => [ProposedLot])
  subdProposedLots?: ProposedLot[];

  //Soil Fields
  @AutoMap(() => Boolean)
  soilIsFollowUp: boolean | null;

  @AutoMap(() => String)
  soilFollowUpIDs: string | null;

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

  @AutoMap(() => Number)
  fillProjectDurationAmount: number | null;

  @AutoMap(() => String)
  fillProjectDurationUnit?: string | null;

  @AutoMap(() => String)
  soilFillTypeToPlace?: string | null;

  @AutoMap(() => String)
  soilAlternativeMeasures?: string | null;

  @AutoMap(() => Boolean)
  soilIsExtractionOrMining?: boolean;

  @AutoMap(() => Boolean)
  soilHasSubmittedNotice?: boolean;

  //NARU Fields
  @AutoMap(() => [NaruSubtypeDto])
  naruSubtype: NaruSubtypeDto | null;

  @AutoMap(() => Number)
  naruFloorArea: number | null;

  @AutoMap(() => String)
  naruResidenceNecessity: string | null;

  @AutoMap(() => String)
  naruLocationRationale: string | null;

  @AutoMap(() => String)
  naruInfrastructure: string | null;

  @AutoMap(() => String)
  naruExistingStructures: string | null;

  @AutoMap(() => Boolean)
  naruWillImportFill: boolean | null;

  @AutoMap(() => String)
  naruFillType: string | null;

  @AutoMap(() => String)
  naruFillOrigin: string | null;

  @AutoMap(() => String)
  naruProjectDuration: string | null;

  @AutoMap(() => Number)
  naruToPlaceVolume: number | null;

  @AutoMap(() => Number)
  naruToPlaceArea: number | null;

  @AutoMap(() => Number)
  naruToPlaceMaximumDepth: number | null;

  @AutoMap(() => Number)
  naruToPlaceAverageDepth: number | null;

  @AutoMap(() => Number)
  naruSleepingUnits: number | null;

  @AutoMap(() => String)
  naruAgriTourism: string | null;

  //Inclusion / Exclusion Fields
  @AutoMap(() => String)
  prescribedBody: string | null;

  @AutoMap(() => Number)
  inclExclHectares: number | null;

  @AutoMap(() => String)
  exclWhyLand: string | null;

  @AutoMap(() => String)
  inclAgricultureSupport: string | null;

  @AutoMap(() => String)
  inclImprovements: string | null;

  @AutoMap(() => Boolean)
  exclShareGovernmentBorders: boolean | null;

  @AutoMap(() => Boolean)
  inclGovernmentOwnsAllParcels?: boolean | null;

  //Covenant Fields
  @AutoMap(() => String)
  coveFarmImpact: string | null;

  @AutoMap(() => Number)
  coveAreaImpacted: number | null;
}

export class PublicApplicationSubmissionReviewDto {
  @AutoMap()
  applicationFileNumber: string;

  @AutoMap(() => String)
  localGovernmentFileNumber: string | null;

  @AutoMap(() => String)
  firstName: string | null;

  @AutoMap(() => String)
  lastName: string | null;

  @AutoMap(() => String)
  position: string | null;

  @AutoMap(() => String)
  department: string | null;

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
