import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PlanningReviewMeetingService } from '../../../../services/planning-review/planning-review-meeting/planning-review-meeting.service';
import { MomentPipe } from '../../../../shared/pipes/moment.pipe';

import { EditMeetingDialogComponent } from './edit-meeting-dialog.component';

describe('EditMeetingDialogComponent', () => {
  let component: EditMeetingDialogComponent;
  let fixture: ComponentFixture<EditMeetingDialogComponent>;
  let mockPlanningReviewMeetingService: DeepMocked<PlanningReviewMeetingService>;

  beforeEach(async () => {
    mockPlanningReviewMeetingService = createMock();
    mockPlanningReviewMeetingService.fetchTypes.mockResolvedValue([]);

    await TestBed.configureTestingModule({
      declarations: [EditMeetingDialogComponent, MomentPipe],
      providers: [
        {
          provide: PlanningReviewMeetingService,
          useValue: mockPlanningReviewMeetingService,
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatDialogModule, MatSnackBarModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
