import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationSubmissionReviewDto } from '../../../../services/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';

import { ReviewContactInformationComponent } from './review-contact-information.component';

describe('ReviewContactInformationComponent', () => {
  let component: ReviewContactInformationComponent;
  let fixture: ComponentFixture<ReviewContactInformationComponent>;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationSubmissionReviewDto | undefined>(
      undefined
    );

    await TestBed.configureTestingModule({
      declarations: [ReviewContactInformationComponent],
      providers: [
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewContactInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
