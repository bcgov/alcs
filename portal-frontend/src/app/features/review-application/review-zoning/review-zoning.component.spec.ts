import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationProposalReviewDto } from '../../../services/application-review/application-proposal-review.dto';
import { ApplicationProposalReviewService } from '../../../services/application-review/application-proposal-review.service';

import { ReviewZoningComponent } from './review-zoning.component';

describe('ReviewZoningComponent', () => {
  let component: ReviewZoningComponent;
  let fixture: ComponentFixture<ReviewZoningComponent>;
  let mockAppReviewService: DeepMocked<ApplicationProposalReviewService>;

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationProposalReviewDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [ReviewZoningComponent],
      providers: [
        {
          provide: ApplicationProposalReviewService,
          useValue: mockAppReviewService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewZoningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
