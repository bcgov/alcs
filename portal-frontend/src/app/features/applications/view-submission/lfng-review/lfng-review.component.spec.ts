import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewDto } from '../../../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { PdfGenerationService } from '../../../../services/pdf-generation/pdf-generation.service';

import { LfngReviewComponent } from './lfng-review.component';

describe('LfngReviewComponent', () => {
  let component: LfngReviewComponent;
  let fixture: ComponentFixture<LfngReviewComponent>;

  let mockAppSubReviewService: DeepMocked<ApplicationSubmissionReviewService>;
  let mockPdfGenerationService: DeepMocked<PdfGenerationService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockAppSubReviewService = createMock();
    mockPdfGenerationService = createMock();
    mockAppDocumentService = createMock();

    mockAppSubReviewService.$applicationReview = new BehaviorSubject<ApplicationSubmissionReviewDto | undefined>(
      undefined
    );

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppSubReviewService,
        },
        {
          provide: PdfGenerationService,
          useValue: mockPdfGenerationService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
      ],
      declarations: [LfngReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LfngReviewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
