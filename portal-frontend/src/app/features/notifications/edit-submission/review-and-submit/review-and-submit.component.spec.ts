import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';
import { PdfGenerationService } from '../../../../services/pdf-generation/pdf-generation.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { ReviewAndSubmitComponent } from './review-and-submit.component';

describe('ReviewAndSubmitComponent', () => {
  let component: ReviewAndSubmitComponent;
  let fixture: ComponentFixture<ReviewAndSubmitComponent>;
  let mockToastService: DeepMocked<ToastService>;
  let mockRouter: DeepMocked<Router>;
  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;

  beforeEach(async () => {
    mockToastService = createMock();
    mockRouter = createMock();
    mockNotificationSubmissionService = createMock();

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
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
        },
        {
          provide: PdfGenerationService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewAndSubmitComponent);
    component = fixture.componentInstance;
    component.$notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
