import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationSubmissionService } from '../../../services/notification/notification-submission/notification-submission.service';
import { NotificationDto } from '../../../services/notification/notification.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { IntakeComponent } from './intake.component';

describe('IntakeComponent', () => {
  let component: IntakeComponent;
  let fixture: ComponentFixture<IntakeComponent>;
  let mockDetailService: DeepMocked<NotificationDetailService>;
  let mockLgService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockSubmissionService: DeepMocked<NotificationSubmissionService>;

  beforeEach(async () => {
    mockDetailService = createMock();
    mockLgService = createMock();
    mockSubmissionService = createMock();

    mockDetailService.$notification = new BehaviorSubject<NotificationDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        {
          provide: NotificationDetailService,
          useValue: mockDetailService,
        },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockLgService,
        },
        {
          provide: NotificationSubmissionService,
          useValue: mockSubmissionService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
      ],
      declarations: [IntakeComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(IntakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
