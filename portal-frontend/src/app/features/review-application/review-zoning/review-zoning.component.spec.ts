import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationReviewDto } from '../../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';

import { ReviewZoningComponent } from './review-zoning.component';

describe('ReviewZoningComponent', () => {
  let component: ReviewZoningComponent;
  let fixture: ComponentFixture<ReviewZoningComponent>;
  let mockAppReviewService: DeepMocked<ApplicationReviewService>;

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationReviewDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [ReviewZoningComponent],
      providers: [
        {
          provide: ApplicationReviewService,
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
