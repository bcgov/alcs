import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionMeetingComponent } from './decision-meeting.component';

describe('DecisionMeetingComponent', () => {
  let component: DecisionMeetingComponent;
  let fixture: ComponentFixture<DecisionMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionMeetingComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: ApplicationDetailService,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        { provide: ConfirmationDialogService, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatSnackBarModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
