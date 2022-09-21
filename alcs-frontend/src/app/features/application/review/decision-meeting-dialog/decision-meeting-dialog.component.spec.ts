import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';
import { MomentPipe } from '../../../../shared/utils/moment.pipe';

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
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatDialogModule, MatSnackBarModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
