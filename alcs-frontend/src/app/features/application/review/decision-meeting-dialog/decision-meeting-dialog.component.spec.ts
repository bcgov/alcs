import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { MomentPipe } from '../../../../shared/pipes/moment.pipe';

import { DecisionMeetingDialogComponent } from './decision-meeting-dialog.component';

describe('DecisionMeetingDialogComponent', () => {
  let component: DecisionMeetingDialogComponent;
  let fixture: ComponentFixture<DecisionMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionMeetingDialogComponent, MomentPipe],
      providers: [
        {
          provide: ApplicationDecisionMeetingService,
          useValue: {},
        },
        {
          provide: ApplicationDetailService,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatDialogModule, MatSnackBarModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
