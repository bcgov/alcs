import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationDecisionMeetingService } from '../../../../services/application/application-decision-meeting/application-decision-meeting.service';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { MomentPipe } from '../../../../shared/pipes/moment.pipe';

import { DecisionMeetingDialogComponent } from './decision-meeting-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DecisionMeetingDialogComponent', () => {
  let component: DecisionMeetingDialogComponent;
  let fixture: ComponentFixture<DecisionMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [DecisionMeetingDialogComponent, MomentPipe],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatDialogModule, MatSnackBarModule, FormsModule],
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
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(DecisionMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
