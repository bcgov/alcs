import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationReviewDto } from '../../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';

import { ReviewResolutionComponent } from './review-resolution.component';

describe('ReviewResolutionComponent', () => {
  let component: ReviewResolutionComponent;
  let fixture: ComponentFixture<ReviewResolutionComponent>;
  let mockAppReviewService: DeepMocked<ApplicationReviewService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationReviewDto | undefined>(undefined);

    mockRouter = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
      declarations: [ReviewResolutionComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewResolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
