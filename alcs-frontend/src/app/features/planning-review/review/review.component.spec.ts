import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { PlanningReviewDetailedDto } from '../../../services/planning-review/planning-review.dto';

import { ReviewComponent } from './review.component';

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;
  let mockPRDetailService: DeepMocked<PlanningReviewDetailService>;

  beforeEach(async () => {
    mockPRDetailService = createMock();
    mockPRDetailService.$planningReview = new BehaviorSubject<PlanningReviewDetailedDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: PlanningReviewDetailService,
          useValue: mockPRDetailService,
        },
      ],
      declarations: [ReviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
