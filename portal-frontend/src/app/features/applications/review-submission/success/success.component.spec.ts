import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApplicationSubmissionReviewDto } from '../../../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../../services/code/code.service';
import { OverlaySpinnerService } from '../../../../shared/overlay-spinner/overlay-spinner.service';

import { SuccessComponent } from './success.component';

describe('SuccessComponent', () => {
  let component: SuccessComponent;
  let fixture: ComponentFixture<SuccessComponent>;
  let applicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let appSubmissionReviewService: DeepMocked<ApplicationSubmissionReviewService>;
  let activatedRoute: DeepMocked<ActivatedRoute>;
  let overlayService: DeepMocked<OverlaySpinnerService>;
  let codeService: DeepMocked<CodeService>;

  beforeEach(() => {
    applicationSubmissionService = createMock();
    activatedRoute = createMock();
    overlayService = createMock();
    codeService = createMock();
    appSubmissionReviewService = createMock();

    appSubmissionReviewService.$applicationReview = new BehaviorSubject<ApplicationSubmissionReviewDto | undefined>(
      undefined
    );

    Object.assign(activatedRoute, { paramMap: new Observable<ParamMap>() });

    codeService.loadCodes.mockResolvedValue({
      applicationTypes: [],
      decisionMakers: [],
      documentTypes: [],
      localGovernments: [],
      naruSubtypes: [],
      noticeOfIntentTypes: [],
      regions: [],
      submissionTypes: [],
    });

    TestBed.configureTestingModule({
      declarations: [SuccessComponent],
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: applicationSubmissionService,
        },
        {
          provide: ApplicationSubmissionReviewService,
          useValue: appSubmissionReviewService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: OverlaySpinnerService,
          useValue: overlayService,
        },
        {
          provide: CodeService,
          useValue: codeService,
        },
      ],
    });
    fixture = TestBed.createComponent(SuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
