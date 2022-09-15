import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';

import { ApplicationMeetingDialogComponent } from './application-meeting-dialog.component';

describe('ApplicationMeetingDialogComponent', () => {
  let component: ApplicationMeetingDialogComponent;
  let fixture: ComponentFixture<ApplicationMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationMeetingDialogComponent],
      providers: [
        {
          provide: ApplicationDecisionMeetingService,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: { meetingType: { code: 'fake', label: 'fake' } } },
        { provide: MatDialogRef, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatDialogModule, MatSnackBarModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
