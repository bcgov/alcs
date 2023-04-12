import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewDto } from '../../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';

import { ReviewAttachmentsComponent } from './review-attachments.component';

describe('ReviewAttachmentsComponent', () => {
  let component: ReviewAttachmentsComponent;
  let fixture: ComponentFixture<ReviewAttachmentsComponent>;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;
  let mockAppService: DeepMocked<ApplicationSubmissionService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let applicationDocumentPipe = new BehaviorSubject<ApplicationDocumentDto[]>([]);

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppService = createMock();
    mockRouter = createMock();
    mockAppDocumentService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationSubmissionReviewDto | undefined>(
      undefined
    );

    await TestBed.configureTestingModule({
      declarations: [ReviewAttachmentsComponent],
      providers: [
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewAttachmentsComponent);
    component = fixture.componentInstance;
    component.$applicationDocuments = applicationDocumentPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
