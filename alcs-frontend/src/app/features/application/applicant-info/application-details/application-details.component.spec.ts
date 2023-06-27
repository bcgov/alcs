import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../services/application/application-document/application-document.service';
import { SubmittedApplicationOwnerDto } from '../../../../services/application/application.dto';

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
      naruExistingStructures: null,
      naruFillOrigin: null,
      naruFillType: null,
      naruFloorArea: null,
      naruInfrastructure: null,
      naruLocationRationale: null,
      naruProjectDurationAmount: null,
      naruProjectDurationUnit: null,
      naruPurpose: null,
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
      nfuPurpose: null,
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
      soilPurpose: null,
      soilReduceNegativeImpacts: null,
      soilToPlaceAverageDepth: null,
      soilToPlaceMaximumDepth: null,
      soilToRemoveArea: null,
      soilToRemoveVolume: null,
      soilTypeRemoved: null,
      subdAgricultureSupport: null,
      subdIsHomeSiteSeverance: null,
      subdPurpose: null,
      subdSuitability: null,
      turAgriculturalActivities: null,
      turOutsideLands: null,
      turPurpose: null,
      turReduceNegativeImpacts: null,
      turTotalCorridorArea: null,
      parcels: [],
      otherParcels: [],
      documents: [],
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
    };
    component.applicationType = 'NFUP';
    component.fileNumber = 'fake';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
