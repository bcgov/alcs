import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationSubmissionReviewDto } from '../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionService } from '../../services/application-submission/application-submission.service';
import { ToastService } from '../../services/toast/toast.service';
import { ReviewApplicationComponent } from './review-application.component';

describe('ReviewApplicationComponent', () => {
  let component: ReviewApplicationComponent;
  let fixture: ComponentFixture<ReviewApplicationComponent>;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;
  let mockAppService: DeepMocked<ApplicationSubmissionService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockRoute;

  let routeParamMap: BehaviorSubject<Map<string, any>>;

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationSubmissionReviewDto | undefined>(
      undefined
    );

    mockAppService = createMock();

    mockRoute = createMock();

    routeParamMap = new BehaviorSubject(new Map());
    mockRoute.paramMap = routeParamMap;

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppService,
        },
        {
          provide: ActivatedRoute,
          useValue: mockRoute,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ToastService,
          useValue: createMock<DeepMocked<ToastService>>(),
        },
      ],
      declarations: [ReviewApplicationComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
