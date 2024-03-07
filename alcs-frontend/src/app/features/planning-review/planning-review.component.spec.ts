import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlanningReviewDetailService } from '../../services/planning-review/planning-review-detail.service';
import { PlanningReviewDetailedDto } from '../../services/planning-review/planning-review.dto';

import { PlanningReviewComponent } from './planning-review.component';

describe('PlanningReviewComponent', () => {
  let component: PlanningReviewComponent;
  let fixture: ComponentFixture<PlanningReviewComponent>;
  let mockPlanningReviewDetailService: DeepMocked<PlanningReviewDetailService>;
  let mockActivateRoute: DeepMocked<ActivatedRoute>;

  beforeEach(() => {
    mockPlanningReviewDetailService = createMock();
    mockActivateRoute = createMock();

    Object.assign(mockActivateRoute, { params: new Observable<ParamMap>() });
    mockPlanningReviewDetailService.$planningReview = new BehaviorSubject<PlanningReviewDetailedDto | undefined>(
      undefined,
    );

    TestBed.configureTestingModule({
      declarations: [PlanningReviewComponent],
      providers: [
        {
          provide: PlanningReviewDetailService,
          useValue: mockPlanningReviewDetailService,
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivateRoute,
        },
      ],
    });
    fixture = TestBed.createComponent(PlanningReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
