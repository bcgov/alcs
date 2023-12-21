import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { ApplicationStatus, ApplicationSubmissionDto, SubmittedApplicationOwnerDto } from '../application.dto';

import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  const mockSubmittedApplication: ApplicationSubmissionDto = {
    applicant: '',
    canEdit: false,
    canReview: false,
    canView: false,
    fileNumber: '',
    lastStatusUpdate: 0,
    localGovernmentUuid: '',
    owners: [],
    soilAlreadyRemovedArea: null,
    soilAlreadyRemovedAverageDepth: null,
    soilAlreadyRemovedMaximumDepth: null,
    soilAlreadyRemovedVolume: null,
    soilToPlaceArea: null,
    soilToPlaceVolume: null,
    soilToRemoveAverageDepth: null,
    soilToRemoveMaximumDepth: null,
    status: {} as ApplicationStatus,
    type: '',
    uuid: '',
    naruExistingStructures: null,
    naruFillOrigin: null,
    naruFillType: null,
    naruFloorArea: null,
    naruInfrastructure: null,
    naruLocationRationale: null,
    naruProjectDuration: null,
    naruResidenceNecessity: null,
    naruSubtype: null,
    naruToPlaceArea: null,
    naruToPlaceAverageDepth: null,
    naruSleepingUnits: null,
    naruAgriTourism: null,
    naruToPlaceMaximumDepth: null,
    naruToPlaceVolume: null,
    naruWillImportFill: null,
    primaryContact: {} as SubmittedApplicationOwnerDto,
    parcelsAgricultureDescription: '',
    parcelsAgricultureImprovementDescription: '',
    parcelsNonAgricultureUseDescription: '',
    northLandUseType: '',
    northLandUseTypeDescription: '',
    eastLandUseType: '',
    eastLandUseTypeDescription: '',
    southLandUseType: '',
    southLandUseTypeDescription: '',
    westLandUseType: '',
    westLandUseTypeDescription: '',
    subdProposedLots: [],
    typeCode: '',
    soilFillTypeToPlace: null,
    nfuAgricultureSupport: null,
    nfuFillOriginDescription: null,
    nfuFillTypeDescription: null,
    nfuFillVolume: null,
    nfuHectares: null,
    nfuMaxFillDepth: null,
    nfuAverageFillDepth: null,
    nfuOutsideLands: null,
    nfuProjectDurationAmount: null,
    nfuProjectDurationUnit: null,
    purpose: '',
    nfuTotalFillArea: null,
    nfuWillImportFill: null,
    soilAlreadyPlacedArea: null,
    soilAlreadyPlacedAverageDepth: null,
    soilAlreadyPlacedMaximumDepth: null,
    soilAlreadyPlacedVolume: null,
    soilAlternativeMeasures: null,
    soilHasSubmittedNotice: null,
    soilIsExtractionOrMining: null,
    soilIsFollowUp: null,
    soilFollowUpIDs: null,
    soilProjectDurationAmount: null,
    soilProjectDurationUnit: null,
    fillProjectDurationAmount: null,
    fillProjectDurationUnit: null,
    soilReduceNegativeImpacts: null,
    soilToPlaceAverageDepth: null,
    soilToPlaceMaximumDepth: null,
    soilToRemoveArea: null,
    soilToRemoveVolume: null,
    soilTypeRemoved: null,
    subdAgricultureSupport: null,
    subdIsHomeSiteSeverance: null,
    subdSuitability: null,
    turAgriculturalActivities: null,
    turOutsideLands: null,
    turReduceNegativeImpacts: null,
    turTotalCorridorArea: null,
    inclAgricultureSupport: null,
    inclImprovements: null,
    exclShareGovernmentBorders: null,
    inclGovernmentOwnsAllParcels: null,
    exclWhyLand: null,
    inclExclHectares: null,
    coveAreaImpacted: null,
    coveFarmImpact: null,
    coveHasDraft: null,
    prescribedBody: null,
    submissionStatuses: [],
  };

  beforeEach(() => {
    mockToastService = createMock();
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastService, useValue: mockToastService },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });
    service = TestBed.inject(ApplicationSubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should successfully fetch application submission', async () => {
    mockHttpClient.get.mockReturnValue(of(mockSubmittedApplication));

    const result = await service.fetchSubmission('1');

    expect(result).toEqual(mockSubmittedApplication);
    expect(mockHttpClient.get).toBeCalledTimes(1);
  });
});
