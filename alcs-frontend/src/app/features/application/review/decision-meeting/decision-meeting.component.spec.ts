import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionMeetingComponent } from './decision-meeting.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DecisionMeetingComponent', () => {
  let component: DecisionMeetingComponent;
  let fixture: ComponentFixture<DecisionMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [DecisionMeetingComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatSnackBarModule],
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
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(DecisionMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
