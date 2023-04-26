import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { PdfGenerationService } from '../../../services/pdf-generation/pdf-generation.service';
import { ToastService } from '../../../services/toast/toast.service';

import { ReviewAndSubmitComponent } from './review-and-submit.component';

describe('ReviewAndSubmitComponent', () => {
  let component: ReviewAndSubmitComponent;
  let fixture: ComponentFixture<ReviewAndSubmitComponent>;
  let mockToastService: DeepMocked<ToastService>;
  let mockRouter: DeepMocked<Router>;
  let mockApplicationService: DeepMocked<ApplicationSubmissionService>;

  beforeEach(async () => {
    mockToastService = createMock();
    mockRouter = createMock();
    mockApplicationService = createMock();

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
          provide: ApplicationSubmissionService,
          useValue: mockApplicationService,
        },
        {
          provide: PdfGenerationService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewAndSubmitComponent);
    component = fixture.componentInstance;
    component.$applicationSubmission = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
