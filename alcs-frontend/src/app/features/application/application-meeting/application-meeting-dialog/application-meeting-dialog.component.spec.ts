import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';
import { MomentPipe } from '../../../../shared/pipes/moment.pipe';
import { StartOfDayPipe } from '../../../../shared/pipes/startOfDay.pipe';

import { ApplicationMeetingDialogComponent } from './application-meeting-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ApplicationMeetingDialogComponent', () => {
  let component: ApplicationMeetingDialogComponent;
  let fixture: ComponentFixture<ApplicationMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ApplicationMeetingDialogComponent, MomentPipe, StartOfDayPipe],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatDialogModule, MatSnackBarModule, FormsModule, ReactiveFormsModule],
    providers: [
        {
            provide: ApplicationDecisionMeetingService,
            useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: { meetingType: { code: 'fake', label: 'fake' } } },
        { provide: MatDialogRef, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ApplicationMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
