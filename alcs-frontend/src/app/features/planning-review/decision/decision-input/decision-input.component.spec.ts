import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PlanningReviewDecisionService } from '../../../../services/planning-review/planning-review-decision/planning-review-decision.service';
import { PlanningReviewDetailService } from '../../../../services/planning-review/planning-review-detail.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { StartOfDayPipe } from '../../../../shared/pipes/startOfDay.pipe';

import { DecisionInputComponent } from './decision-input.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DecisionInputComponent', () => {
  let component: DecisionInputComponent;
  let fixture: ComponentFixture<DecisionInputComponent>;
  let mockPRDecService: DeepMocked<PlanningReviewDecisionService>;
  let mockPRDetailService: DeepMocked<PlanningReviewDetailService>;
  let mockRouter: DeepMocked<Router>;
  let mockToastService: DeepMocked<ToastService>;
  let mockMatDialog: DeepMocked<MatDialog>;

  beforeEach(async () => {
    mockPRDecService = createMock();
    mockToastService = createMock();
    mockRouter = createMock();
    mockRouter.navigateByUrl.mockResolvedValue(true);
    mockMatDialog = createMock();
    mockPRDetailService = createMock();

    await TestBed.configureTestingModule({
    declarations: [DecisionInputComponent, StartOfDayPipe],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        {
            provide: PlanningReviewDecisionService,
            useValue: mockPRDecService,
        },
        { provide: PlanningReviewDetailService, useValue: mockPRDetailService },
        {
            provide: ToastService,
            useValue: mockToastService,
        },
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    paramMap: convertToParamMap({ uuid: 'fake' }),
                },
            },
        },
        {
            provide: Router,
            useValue: mockRouter,
        },
        {
            provide: MatDialog,
            useValue: mockMatDialog,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(DecisionInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
