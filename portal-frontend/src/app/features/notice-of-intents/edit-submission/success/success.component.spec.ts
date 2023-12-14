import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Observable } from 'rxjs';
import { CodeService } from '../../../../services/code/code.service';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { OverlaySpinnerService } from '../../../../shared/overlay-spinner/overlay-spinner.service';

import { SuccessComponent } from './success.component';

describe('SuccessComponent', () => {
  let component: SuccessComponent;
  let fixture: ComponentFixture<SuccessComponent>;
  let noiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let activatedRoute: DeepMocked<ActivatedRoute>;
  let overlayService: DeepMocked<OverlaySpinnerService>;
  let codeService: DeepMocked<CodeService>;

  beforeEach(() => {
    noiSubmissionService = createMock();
    activatedRoute = createMock();
    overlayService = createMock();
    codeService = createMock();

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
          provide: NoticeOfIntentSubmissionService,
          useValue: noiSubmissionService,
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
