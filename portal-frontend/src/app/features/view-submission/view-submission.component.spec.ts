import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewDto } from '../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionService } from '../../services/application-submission/application-submission.service';
import { PdfGenerationService } from '../../services/pdf-generation/pdf-generation.service';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';

import { ViewSubmissionComponent } from './view-submission.component';

describe('ViewSubmissionComponent', () => {
  let component: ViewSubmissionComponent;
  let fixture: ComponentFixture<ViewSubmissionComponent>;

  let mockRoute;
  let mockAppService: DeepMocked<ApplicationSubmissionService>;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;
  let mockDialogService: DeepMocked<ConfirmationDialogService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  let routeParamMap: BehaviorSubject<Map<string, any>>;

  beforeEach(async () => {
    mockRoute = createMock();
    mockAppService = createMock();
    mockAppReviewService = createMock();
    mockAppDocumentService = createMock();

    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationSubmissionReviewDto | undefined>(
      undefined
    );

    routeParamMap = new BehaviorSubject(new Map());
    mockRoute.paramMap = routeParamMap;

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockRoute,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: mockDialogService,
        },
        {
          provide: PdfGenerationService,
          useValue: {},
        },
      ],
      declarations: [ViewSubmissionComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
