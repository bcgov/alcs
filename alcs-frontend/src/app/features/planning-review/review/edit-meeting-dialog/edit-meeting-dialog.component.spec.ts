import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PlanningReviewMeetingService } from '../../../../services/planning-review/planning-review-meeting/planning-review-meeting.service';
import { MomentPipe } from '../../../../shared/pipes/moment.pipe';

import { EditMeetingDialogComponent } from './edit-meeting-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('EditMeetingDialogComponent', () => {
  let component: EditMeetingDialogComponent;
  let fixture: ComponentFixture<EditMeetingDialogComponent>;
  let mockPlanningReviewMeetingService: DeepMocked<PlanningReviewMeetingService>;

  beforeEach(async () => {
    mockPlanningReviewMeetingService = createMock();
    mockPlanningReviewMeetingService.fetchTypes.mockResolvedValue([]);

    await TestBed.configureTestingModule({
    declarations: [EditMeetingDialogComponent, MomentPipe],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatDialogModule, MatSnackBarModule, FormsModule],
    providers: [
        {
            provide: PlanningReviewMeetingService,
            useValue: mockPlanningReviewMeetingService,
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(EditMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
