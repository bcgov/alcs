import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../services/application/application-document/application-document.service';
import { ApplicationStatus, SubmittedApplicationOwnerDto } from '../../../../services/application/application.dto';

import { ApplicationDetailsComponent } from './application-details.component';

describe('ApplicationDetailsComponent', () => {
  let component: ApplicationDetailsComponent;
  let fixture: ComponentFixture<ApplicationDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockAppDocumentService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
      ],
      declarations: [ApplicationDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDetailsComponent);
    component = fixture.componentInstance;
    component.submission = {
      exclShareGovernmentBorders: null,
      inclGovernmentOwnsAllParcels: null,
      exclWhyLand: null,
      inclAgricultureSupport: null,
      inclExclHectares: null,
      inclImprovements: null,
      prescribedBody: null,
      applicant: '',
      purpose: '',
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
      naruProjectDurationAmount: null,
      naruProjectDurationUnit: null,
      naruResidenceNecessity: null,
      naruSubtype: null,
      naruToPlaceArea: null,
      naruToPlaceAverageDepth: null,
      naruToPlaceMaximumDepth: null,
      naruToPlaceVolume: null,
      naruWillImportFill: null,
      naruAgriTourism: null,
      naruSleepingUnits: null,
      nfuAgricultureSupport: null,
      nfuFillOriginDescription: null,
      nfuFillTypeDescription: null,
      nfuFillVolume: null,
      nfuHectares: null,
      nfuMaxFillDepth: null,
      nfuOutsideLands: null,
      nfuProjectDurationAmount: null,
      nfuProjectDurationUnit: null,
      nfuTotalFillPlacement: null,
      nfuWillImportFill: null,
      soilAlreadyPlacedArea: null,
      soilAlreadyPlacedAverageDepth: null,
      soilAlreadyPlacedMaximumDepth: null,
      soilAlreadyPlacedVolume: null,
      soilAlternativeMeasures: null,
      soilApplicationIDs: null,
      soilFillTypeToPlace: null,
      soilHasPreviousALCAuthorization: null,
      soilHasSubmittedNotice: null,
      soilIsExtractionOrMining: null,
      soilIsNOIFollowUp: null,
      soilNOIIDs: null,
      soilProjectDurationAmount: null,
      soilProjectDurationUnit: null,
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
      primaryContact: {
        type: {
          code: '',
        },
      } as SubmittedApplicationOwnerDto,
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
      submissionStatuses: [],
    };
    component.applicationType = 'NFUP';
    component.fileNumber = 'fake';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
