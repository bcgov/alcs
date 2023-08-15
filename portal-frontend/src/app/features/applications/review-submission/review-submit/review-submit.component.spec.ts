import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewDto } from '../../../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionDto } from '../../../../services/application-submission/application-submission.dto';
import { PdfGenerationService } from '../../../../services/pdf-generation/pdf-generation.service';

import { ReviewSubmitComponent } from './review-submit.component';

describe('ReviewSubmitComponent', () => {
  let component: ReviewSubmitComponent;
  let fixture: ComponentFixture<ReviewSubmitComponent>;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockPdfGenerationService: DeepMocked<PdfGenerationService>;

  let applicationPipe = new BehaviorSubject<ApplicationSubmissionDto | undefined>(undefined);
  let applicationDocumentPipe = new BehaviorSubject<ApplicationDocumentDto[]>([]);

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationSubmissionReviewDto | undefined>(
      undefined
    );

    mockAppDocumentService = createMock();
    mockPdfGenerationService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },

        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: PdfGenerationService,
          useValue: mockPdfGenerationService,
        },
      ],
      declarations: [ReviewSubmitComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewSubmitComponent);
    component = fixture.componentInstance;

    component.$application = applicationPipe;
    component.$applicationDocuments = applicationDocumentPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
