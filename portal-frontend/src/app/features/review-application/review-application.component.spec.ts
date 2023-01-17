import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationReviewDto } from '../../services/application-review/application-review.dto';
import { ApplicationReviewService } from '../../services/application-review/application-review.service';
import { ApplicationService } from '../../services/application/application.service';
import { ReviewApplicationComponent } from './review-application.component';

describe('ReviewApplicationComponent', () => {
  let component: ReviewApplicationComponent;
  let fixture: ComponentFixture<ReviewApplicationComponent>;
  let mockAppReviewService: DeepMocked<ApplicationReviewService>;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockRoute;

  let routeParamMap: BehaviorSubject<Map<string, any>>;

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationReviewDto | undefined>(undefined);

    mockAppService = createMock();

    mockRoute = createMock();

    routeParamMap = new BehaviorSubject(new Map());
    mockRoute.paramMap = routeParamMap;

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
        {
          provide: ActivatedRoute,
          useValue: mockRoute,
        },
      ],
      declarations: [ReviewApplicationComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
