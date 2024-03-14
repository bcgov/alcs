import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { PlanningReviewDecisionDto } from '../../../../services/planning-review/planning-review-decision/planning-review-decision.dto';
import { PlanningReviewDecisionService } from '../../../../services/planning-review/planning-review-decision/planning-review-decision.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { DecisionDocumentsComponent } from './decision-documents.component';

describe('DecisionDocumentsComponent', () => {
  let component: DecisionDocumentsComponent;
  let fixture: ComponentFixture<DecisionDocumentsComponent>;
  let mockPRDecService: DeepMocked<PlanningReviewDecisionService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockPRDecService = createMock();
    mockDialog = createMock();
    mockToastService = createMock();
    mockPRDecService.$decision = new BehaviorSubject<PlanningReviewDecisionDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [DecisionDocumentsComponent],
      providers: [
        {
          provide: PlanningReviewDecisionService,
          useValue: mockPRDecService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
