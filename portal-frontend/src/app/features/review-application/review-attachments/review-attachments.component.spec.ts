import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationReviewDto } from '../../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';

import { ReviewAttachmentsComponent } from './review-attachments.component';

describe('ReviewAttachmentsComponent', () => {
  let component: ReviewAttachmentsComponent;
  let fixture: ComponentFixture<ReviewAttachmentsComponent>;
  let mockAppReviewService: DeepMocked<ApplicationReviewService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockRouter = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationReviewDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [ReviewAttachmentsComponent],
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
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
