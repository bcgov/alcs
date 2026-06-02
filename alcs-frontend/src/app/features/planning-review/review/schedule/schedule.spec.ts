import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PlanningReviewDetailService } from '../../../../services/planning-review/planning-review-detail.service';
import { PlanningReviewMeetingService } from '../../../../services/planning-review/planning-review-meeting/planning-review-meeting.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ScheduleComponent } from './schedule';

describe('ScheduleComponent', () => {
  let component: ScheduleComponent;
  let fixture: ComponentFixture<ScheduleComponent>;
  let mockPRDetailService: DeepMocked<PlanningReviewDetailService>;

  beforeEach(async () => {
    mockPRDetailService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ScheduleComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatSnackBarModule],
      providers: [
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
        {
          provide: PlanningReviewMeetingService,
          useValue: {},
        },
        {
          provide: PlanningReviewDetailService,
          useValue: mockPRDetailService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
