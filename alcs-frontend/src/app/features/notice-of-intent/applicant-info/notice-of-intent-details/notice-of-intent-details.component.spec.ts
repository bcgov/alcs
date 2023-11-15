import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoiDocumentService } from '../../../../services/notice-of-intent/noi-document/noi-document.service';
import { NoticeOfIntentStatusDto } from '../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import { NOI_SUBMISSION_STATUS } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../../services/toast/toast.service';

import { NoticeOfIntentDetailsComponent } from './notice-of-intent-details.component';

describe('NoticeOfIntentDetailsComponent', () => {
  let component: NoticeOfIntentDetailsComponent;
  let fixture: ComponentFixture<NoticeOfIntentDetailsComponent>;

  let mockNoiDocumentService: DeepMocked<NoiDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let mockToastService: DeepMocked<ToastService>;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;

  beforeEach(async () => {
    mockNoiDocumentService = createMock();
    mockRouter = createMock();
    mockNoiSubmissionService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NoiDocumentService,
          useValue: mockNoiDocumentService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
      ],
      declarations: [NoticeOfIntentDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeOfIntentDetailsComponent);
    component = fixture.componentInstance;
    component.submission = {
      fileNumber: '',
      uuid: '',
      createdAt: 1,
      updatedAt: 1,
      applicant: '',
      localGovernmentUuid: '',
      type: '',
      typeCode: '',
      status: {
        code: NOI_SUBMISSION_STATUS.IN_PROGRESS,
        portalBackgroundColor: '',
        portalColor: '',
      } as NoticeOfIntentStatusDto,
      submissionStatuses: [],
      owners: [],
      canEdit: false,
      canView: false,

      purpose: '',
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

      primaryContactOwnerUuid: null,
      primaryContact: undefined,

      //Soil Fields
      soilIsRemovingSoilForNewStructure: null,
      soilIsFollowUp: null,
      soilFollowUpIDs: '',
      soilTypeRemoved: '',
      soilToRemoveVolume: null,
      soilToRemoveArea: null,
      soilToRemoveMaximumDepth: null,
      soilToRemoveAverageDepth: null,
      soilAlreadyRemovedVolume: null,
      soilAlreadyRemovedArea: null,
      soilAlreadyRemovedMaximumDepth: null,
      soilAlreadyRemovedAverageDepth: null,
      soilToPlaceVolume: null,
      soilToPlaceArea: null,
      soilToPlaceMaximumDepth: null,
      soilToPlaceAverageDepth: null,
      soilAlreadyPlacedVolume: null,
      soilAlreadyPlacedArea: null,
      soilAlreadyPlacedMaximumDepth: null,
      soilAlreadyPlacedAverageDepth: null,
      soilProjectDurationAmount: null,
      soilProjectDurationUnit: null,
      fillProjectDurationUnit: null,
      fillProjectDurationAmount: null,
      soilFillTypeToPlace: null,
      soilProposedStructures: [],
    };
    component.noiType = 'ROSO';
    component.fileNumber = 'fake';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
