import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationReviewDto } from '../../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../../services/application-review/application-review.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';

import { ReviewSubmitFngComponent } from './review-submit-fng.component';

describe('ReviewSubmitComponent', () => {
  let component: ReviewSubmitFngComponent;
  let fixture: ComponentFixture<ReviewSubmitFngComponent>;
  let mockAppReviewService: DeepMocked<ApplicationReviewService>;
  let mockAppService: DeepMocked<ApplicationService>;

  let applicationPipe = new BehaviorSubject<ApplicationDto | undefined>(undefined);

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationReviewDto | undefined>(undefined);

    mockAppService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
      ],
      declarations: [ReviewSubmitFngComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewSubmitFngComponent);
    component = fixture.componentInstance;

    component.$application = applicationPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
