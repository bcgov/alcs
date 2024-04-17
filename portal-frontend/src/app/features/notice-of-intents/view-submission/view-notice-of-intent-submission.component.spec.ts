import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { PdfGenerationService } from '../../../services/pdf-generation/pdf-generation.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { NoticeOfIntentParcelService } from '../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { ViewNoticeOfIntentSubmissionComponent } from './view-notice-of-intent-submission.component';

describe('ViewNoticeOfIntentSubmissionComponent', () => {
  let component: ViewNoticeOfIntentSubmissionComponent;
  let fixture: ComponentFixture<ViewNoticeOfIntentSubmissionComponent>;

  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockNoticeOfIntentParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockActivatedRoute: DeepMocked<any>;
  let mockDialogService: DeepMocked<ConfirmationDialogService>;
  let mockPDFGenerationService: DeepMocked<PdfGenerationService>;

  beforeEach(async () => {
    mockNoiSubmissionService = createMock();
    mockNoiDocumentService = createMock();
    mockActivatedRoute = createMock();
    mockPDFGenerationService = createMock();
    mockNoticeOfIntentParcelService = createMock();

    mockActivatedRoute.paramMap = new BehaviorSubject(new Map());

    await TestBed.configureTestingModule({
      declarations: [ViewNoticeOfIntentSubmissionComponent],
      providers: [
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocumentService,
        },
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNoticeOfIntentParcelService,
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
        {
          provide: ConfirmationDialogService,
          useValue: mockDialogService,
        },
        {
          provide: PdfGenerationService,
          useValue: mockPDFGenerationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewNoticeOfIntentSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
