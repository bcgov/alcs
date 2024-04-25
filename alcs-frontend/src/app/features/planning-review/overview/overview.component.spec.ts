import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { PlanningReviewTimelineService } from '../../../services/planning-review/planning-review-timeline/planning-review-timeline.service';
import { PlanningReviewDetailedDto } from '../../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../../services/planning-review/planning-review.service';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let mockPRDetailService: DeepMocked<PlanningReviewDetailService>;
  let mockPRService: DeepMocked<PlanningReviewService>;
  let mockTimelineService: DeepMocked<PlanningReviewTimelineService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockLocalGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;

  beforeEach(async () => {
    mockPRService = createMock();
    mockTimelineService = createMock();
    mockLocalGovernmentService = createMock();

    mockPRDetailService = createMock();
    mockPRDetailService.$planningReview = new BehaviorSubject<PlanningReviewDetailedDto | undefined>(undefined);

    mockApplicationService = createMock();
    mockApplicationService.$applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: PlanningReviewDetailService,
          useValue: mockPRDetailService,
        },
        {
          provide: PlanningReviewService,
          useValue: mockPRService,
        },
        {
          provide: PlanningReviewTimelineService,
          useValue: mockTimelineService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
      ],
      declarations: [OverviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
