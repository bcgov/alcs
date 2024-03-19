import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { PlanningReviewDecisionDto } from '../../../services/planning-review/planning-review-decision/planning-review-decision.dto';
import { PlanningReviewDecisionService } from '../../../services/planning-review/planning-review-decision/planning-review-decision.service';
import { PlanningReviewDetailService } from '../../../services/planning-review/planning-review-detail.service';
import { PlanningReviewDetailedDto } from '../../../services/planning-review/planning-review.dto';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionComponent } from './decision.component';

describe('DecisionComponent', () => {
  let component: DecisionComponent;
  let fixture: ComponentFixture<DecisionComponent>;
  let mockPRDecisionService: DeepMocked<PlanningReviewDecisionService>;
  let mockPRDetailService: DeepMocked<PlanningReviewDetailService>;

  beforeEach(async () => {
    mockPRDecisionService = createMock();
    mockPRDecisionService.$decision = new BehaviorSubject<PlanningReviewDecisionDto | undefined>(undefined);
    mockPRDecisionService.$decisions = new BehaviorSubject<PlanningReviewDecisionDto[]>([]);

    mockPRDetailService = createMock();
    mockPRDetailService.$planningReview = new BehaviorSubject<PlanningReviewDetailedDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule, MatMenuModule],
      declarations: [DecisionComponent],
      providers: [
        {
          provide: PlanningReviewDecisionService,
          useValue: mockPRDecisionService,
        },
        {
          provide: PlanningReviewDetailService,
          useValue: mockPRDetailService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
