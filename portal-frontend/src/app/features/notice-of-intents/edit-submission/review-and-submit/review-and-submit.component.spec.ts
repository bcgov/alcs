import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { PdfGenerationService } from '../../../../services/pdf-generation/pdf-generation.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { ReviewAndSubmitComponent } from './review-and-submit.component';

describe('ReviewAndSubmitComponent', () => {
  let component: ReviewAndSubmitComponent;
  let fixture: ComponentFixture<ReviewAndSubmitComponent>;
  let mockToastService: DeepMocked<ToastService>;
  let mockRouter: DeepMocked<Router>;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;

  beforeEach(async () => {
    mockToastService = createMock();
    mockRouter = createMock();
    mockNoiSubmissionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ReviewAndSubmitComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: PdfGenerationService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewAndSubmitComponent);
    component = fixture.componentInstance;
    component.$noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
