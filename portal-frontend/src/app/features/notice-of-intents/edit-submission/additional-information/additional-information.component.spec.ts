import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import {
  NOI_SUBMISSION_STATUS,
  NoticeOfIntentSubmissionDetailedDto,
} from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { AdditionalInformationComponent, STRUCTURE_TYPES } from './additional-information.component';

describe('AdditionalInformationComponent', () => {
  let component: AdditionalInformationComponent;
  let fixture: ComponentFixture<AdditionalInformationComponent>;
  let mockNoticeOfIntentSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNoticeOfIntentDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockDialogService: DeepMocked<ConfirmationDialogService>;
  let mockDialog: DeepMocked<MatDialog>;

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
    type: {
      value: '',
      label: '',
    },
    typeCode: '',
    updatedAt: 0,
    uuid: '',
    westLandUseType: '',
    westLandUseTypeDescription: '',
  };

  beforeEach(async () => {
    mockNoticeOfIntentSubmissionService = createMock();
    mockNoticeOfIntentDocumentService = createMock();
    mockDialog = createMock();

    await TestBed.configureTestingModule({
      declarations: [AdditionalInformationComponent],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoticeOfIntentSubmissionService,
        },
        { provide: NoticeOfIntentDocumentService, useValue: mockNoticeOfIntentDocumentService },
        {
          provide: ConfirmationDialogService,
          useValue: mockDialogService,
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalInformationComponent);
    component = fixture.componentInstance;
    component.$noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
    component.$noiDocuments = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);
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
  });

  it('should set the first question based on the NOI Type', () => {
    component.$noiSubmission.next({
      ...emptySubmission,
      typeCode: 'ROSO',
    });
    fixture.detectChanges();

    expect(component.firstQuestion).toEqual('Are you placing fill in order to build a structure?');
  });

  it('should set up the form based on the existing proposal with a principal residence', () => {
    const mockFilledSubmission: NoticeOfIntentSubmissionDetailedDto = {
      ...emptySubmission,
      soilIsRemovingSoilForNewStructure: true,
      soilStructureFarmUseReason: 'soilStructureFarmUseReason',
      soilStructureResidentialUseReason: 'soilStructureResidentialUseReason',
      soilProposedStructures: [
        {
          type: STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
          area: 5,
        },
      ],
    };

    component.$noiSubmission.next({
      ...mockFilledSubmission,
    });
    fixture.whenStable();

    expect(component.form.controls.isRemovingSoilForNewStructure.value).toEqual('true');
    expect(component.form.controls.soilStructureFarmUseReason.value).toEqual(null);
    expect(component.form.controls.soilStructureResidentialUseReason.value).toEqual(
      'soilStructureResidentialUseReason',
    );
    expect(Object.values(component.structuresForm.controls).length).toEqual(2);
    expect(component.isSoilStructureResidentialUseReasonVisible).toBeTruthy();
    expect(component.isSoilAgriParcelActivityVisible).toBeFalsy();
    expect(component.isSoilOtherUseReasonVisible).toBeFalsy();
    expect(component.isSoilStructureResidentialAccessoryUseReasonVisible).toBeFalsy();
  });

  it('should set up the form based on the existing proposal with a farm structure', () => {
    const mockFilledSubmission: NoticeOfIntentSubmissionDetailedDto = {
      ...emptySubmission,
      soilIsRemovingSoilForNewStructure: true,
      soilStructureFarmUseReason: 'soilStructureFarmUseReason',
      soilStructureResidentialUseReason: 'soilStructureResidentialUseReason',
      soilProposedStructures: [
        {
          type: STRUCTURE_TYPES.FARM_STRUCTURE,
          area: 5,
        },
      ],
    };

    component.$noiSubmission.next({
      ...mockFilledSubmission,
    });
    fixture.whenStable();

    expect(component.form.controls.isRemovingSoilForNewStructure.value).toEqual('true');
    expect(component.form.controls.soilStructureFarmUseReason.value).toEqual('soilStructureFarmUseReason');
    expect(component.form.controls.soilStructureResidentialUseReason.value).toEqual(null);
    expect(component.isSoilStructureResidentialUseReasonVisible).toBeFalsy();
    expect(component.isSoilAgriParcelActivityVisible).toBeTruthy();
    expect(component.isSoilOtherUseReasonVisible).toBeFalsy();
    expect(component.isSoilStructureResidentialAccessoryUseReasonVisible).toBeFalsy();
  });

  it('should set up the form based on the existing proposal with an other structure', () => {
    const mockFilledSubmission: NoticeOfIntentSubmissionDetailedDto = {
      ...emptySubmission,
      soilIsRemovingSoilForNewStructure: true,
      soilStructureFarmUseReason: 'soilStructureFarmUseReason',
      soilStructureResidentialUseReason: 'soilStructureResidentialUseReason',
      soilProposedStructures: [
        {
          type: STRUCTURE_TYPES.OTHER_STRUCTURE,
          area: 5,
        },
      ],
    };

    component.$noiSubmission.next({
      ...mockFilledSubmission,
    });
    fixture.whenStable();

    expect(component.form.controls.isRemovingSoilForNewStructure.value).toEqual('true');
    expect(component.form.controls.soilStructureFarmUseReason.value).toEqual(null);
    expect(component.form.controls.soilStructureResidentialUseReason.value).toEqual(null);
    expect(component.isSoilStructureResidentialUseReasonVisible).toBeFalsy();
    expect(component.isSoilAgriParcelActivityVisible).toBeFalsy();
    expect(component.isSoilOtherUseReasonVisible).toBeTruthy();
    expect(component.isSoilStructureResidentialAccessoryUseReasonVisible).toBeFalsy();
  });

  it('should set up the form based on the existing proposal with an accessory structure', () => {
    const mockFilledSubmission: NoticeOfIntentSubmissionDetailedDto = {
      ...emptySubmission,
      soilIsRemovingSoilForNewStructure: true,
      soilStructureFarmUseReason: 'soilStructureFarmUseReason',
      soilStructureResidentialUseReason: 'soilStructureResidentialUseReason',
      soilProposedStructures: [
        {
          type: STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
          area: 5,
        },
      ],
    };

    component.$noiSubmission.next({
      ...mockFilledSubmission,
    });
    fixture.whenStable();

    expect(component.form.controls.isRemovingSoilForNewStructure.value).toEqual('true');
    expect(component.form.controls.soilStructureFarmUseReason.value).toEqual(null);
    expect(component.form.controls.soilStructureResidentialUseReason.value).toEqual(
      'soilStructureResidentialUseReason',
    );
    expect(component.isSoilStructureResidentialUseReasonVisible).toBeTruthy();
    expect(component.isSoilAgriParcelActivityVisible).toBeFalsy();
    expect(component.isSoilOtherUseReasonVisible).toBeFalsy();
    expect(component.isSoilStructureResidentialAccessoryUseReasonVisible).toBeTruthy();
  });

  it('should remove controls and reset visibility when deleting a accessory structure', () => {
    const mockFilledSubmission: NoticeOfIntentSubmissionDetailedDto = {
      ...emptySubmission,
      soilIsRemovingSoilForNewStructure: true,
      soilStructureFarmUseReason: 'soilStructureFarmUseReason',
      soilStructureResidentialUseReason: 'soilStructureResidentialUseReason',
      soilProposedStructures: [
        {
          type: STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
          area: 5,
        },
      ],
    };

    component.$noiSubmission.next({
      ...mockFilledSubmission,
    });
    fixture.whenStable();
    const mockConfirmDialog = new BehaviorSubject<true>(true);
    mockDialog.open.mockReturnValue({
      beforeClosed: () => mockConfirmDialog,
    } as any);

    component.onStructureRemove(component.proposedStructures[0].id);

    expect(Object.keys(component.structuresForm.controls)).toEqual([]);

    expect(component.isSoilStructureResidentialUseReasonVisible).toBeFalsy();
    expect(component.isSoilStructureResidentialAccessoryUseReasonVisible).toBeFalsy();
  });

  it('should create form fields when adding a structure', () => {
    component.$noiSubmission.next({
      ...emptySubmission,
    });
    fixture.whenStable();

    component.onStructureAdd();

    expect(Object.keys(component.structuresForm.controls).length).toEqual(2);
  });
});
