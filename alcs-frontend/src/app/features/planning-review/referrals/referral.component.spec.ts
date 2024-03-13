import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { PlanningReferralService } from '../../../services/planning-review/planning-referral.service';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { PlanningReviewDetailedDto } from '../../../services/planning-review/planning-review.dto';

import { ReferralComponent } from './referral.component';

describe('OverviewComponent', () => {
  let component: ReferralComponent;
  let fixture: ComponentFixture<ReferralComponent>;
  let mockPRDetailService: DeepMocked<PlanningReviewDetailService>;
  let mockPRService: DeepMocked<PlanningReferralService>;

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
          provide: PlanningReferralService,
          useValue: mockPRService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [ReferralComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
