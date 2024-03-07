import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDecisionService } from '../../../services/notice-of-intent/decision/notice-of-intent-decision.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentTimelineService } from '../../../services/notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { PlanningReviewDetailedDto } from '../../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../../services/planning-review/planning-review.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { OverviewComponent } from './overview.component';
import { NoticeOfIntentSubmissionStatusService } from '../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let mockPRDetailService: DeepMocked<PlanningReviewDetailService>;
  let mockPRService: DeepMocked<PlanningReviewService>;

  beforeEach(async () => {
    mockPRService = createMock();

    mockPRDetailService = createMock();
    mockPRDetailService.$planningReview = new BehaviorSubject<PlanningReviewDetailedDto | undefined>(undefined);
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
