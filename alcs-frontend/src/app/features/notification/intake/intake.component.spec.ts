import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationSubmissionService } from '../../../services/notification/notification-submission/notification-submission.service';
import { NotificationTimelineService } from '../../../services/notification/notification-timeline/notification-timeline.service';
import { NotificationDto } from '../../../services/notification/notification.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { IntakeComponent } from './intake.component';

describe('IntakeComponent', () => {
  let component: IntakeComponent;
  let fixture: ComponentFixture<IntakeComponent>;
  let mockDetailService: DeepMocked<NotificationDetailService>;
  let mockLgService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockTimelineService: DeepMocked<NotificationTimelineService>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockDetailService = createMock();
    mockLgService = createMock();
    mockSubmissionService = createMock();
    mockTimelineService = createMock();
    mockApplicationService = createMock();

    mockDetailService.$notification = new BehaviorSubject<NotificationDto | undefined>(undefined);
    mockApplicationService.$applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

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
          provide: NotificationTimelineService,
          useValue: mockTimelineService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
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
