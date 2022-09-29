import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { CreateApplicationMeetingComponent } from './application-meeting.component';

describe('ApplicationMeetingComponent', () => {
  let component: CreateApplicationMeetingComponent;
  let fixture: ComponentFixture<CreateApplicationMeetingComponent>;
  const mockAppDetailService = jasmine.createSpyObj<ApplicationDetailService>('ApplicationDetailService', [
    'loadApplication',
  ]);
  mockAppDetailService.$application = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateApplicationMeetingComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        { provide: ApplicationDetailService, useValue: mockAppDetailService },
        { provide: ConfirmationDialogService, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatSnackBarModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApplicationMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
