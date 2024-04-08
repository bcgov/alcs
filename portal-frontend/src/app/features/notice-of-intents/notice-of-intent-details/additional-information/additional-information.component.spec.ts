import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NOI_SUBMISSION_STATUS } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';

import { AdditionalInformationComponent } from './additional-information.component';

describe('RosoAdditionalInformationComponent', () => {
  let component: AdditionalInformationComponent;
  let fixture: ComponentFixture<AdditionalInformationComponent>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  const emptySubmission = {
    applicant: '',
    canEdit: false,
    canView: false,
    createdAt: 0,
    eastLandUseType: '',
    eastLandUseTypeDescription: '',
    fileNumber: '',
    fillProjectDuration: null,
    lastStatusUpdate: 0,
    localGovernmentUuid: '',
    northLandUseType: '',
    northLandUseTypeDescription: '',
    owners: [],
    parcelsAgricultureDescription: '',
    parcelsAgricultureImprovementDescription: '',
    parcelsNonAgricultureUseDescription: '',
    primaryContactOwnerUuid: null,
    purpose: null,
    soilAgriParcelActivity: null,
    soilAlreadyPlacedArea: null,
    soilAlreadyPlacedAverageDepth: null,
    soilAlreadyPlacedMaximumDepth: null,
    soilAlreadyPlacedVolume: null,
    soilAlreadyRemovedArea: null,
    soilAlreadyRemovedAverageDepth: null,
    soilAlreadyRemovedMaximumDepth: null,
    soilAlreadyRemovedVolume: null,
    soilFillTypeToPlace: null,
    soilFollowUpIDs: null,
    soilHasSubmittedNotice: null,
    soilIsAreaWideFilling: null,
    soilIsExtractionOrMining: null,
    soilIsFollowUp: null,
    soilIsRemovingSoilForNewStructure: null,
    soilProjectDuration: null,
    soilProposedStructures: [],
    soilStructureFarmUseReason: null,
    soilStructureOtherUseReason: null,
    soilStructureResidentialAccessoryUseReason: null,
    soilStructureResidentialUseReason: null,
    soilToPlaceArea: null,
    soilToPlaceAverageDepth: null,
    soilToPlaceMaximumDepth: null,
    soilToPlaceVolume: null,
    soilToRemoveArea: null,
    soilToRemoveAverageDepth: null,
    soilToRemoveMaximumDepth: null,
    soilToRemoveVolume: null,
    soilTypeRemoved: null,
    southLandUseType: '',
    southLandUseTypeDescription: '',
    status: {
      code: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      portalBackgroundColor: '',
      portalColor: '',
      label: '',
      description: '',
    },
    submissionStatuses: [],
    type: '',
    typeCode: '',
    updatedAt: 0,
    uuid: '',
    westLandUseType: '',
    westLandUseTypeDescription: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdditionalInformationComponent],
      providers: [
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide all additional inputs by default', () => {
    expect(component.isSoilStructureFarmUseReasonVisible).toBeFalsy();
    expect(component.isSoilStructureResidentialUseReasonVisible).toBeFalsy();
    expect(component.isSoilAgriParcelActivityVisible).toBeFalsy();
    expect(component.isSoilStructureResidentialAccessoryUseReasonVisible).toBeFalsy();
    expect(component.isSoilOtherStructureVisible).toBeFalsy();
  });

  it('should set the first question based on the NOI Type', () => {
    component.noiSubmission = {
      ...emptySubmission,
      typeCode: 'ROSO',
    };

    expect(component.firstQuestion).toEqual('Are you placing fill in order to build a structure?');
  });
});
