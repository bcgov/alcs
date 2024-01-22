import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CodeService } from '../../../../services/code/code.service';
import { NotificationDocumentDto } from '../../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../../services/notification-document/notification-document.service';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { OtherAttachmentsComponent } from './other-attachments.component';

describe('OtherAttachmentsComponent', () => {
  let component: OtherAttachmentsComponent;
  let fixture: ComponentFixture<OtherAttachmentsComponent>;
  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockNotificationDocumentService: DeepMocked<NotificationDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let mockCodeService: DeepMocked<CodeService>;

  let documentPipe = new BehaviorSubject<NotificationDocumentDto[]>([]);

  beforeEach(async () => {
    mockNotificationSubmissionService = createMock();
    mockNotificationDocumentService = createMock();
    mockRouter = createMock();
    mockCodeService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
        },
        {
          provide: NotificationDocumentService,
          useValue: mockNotificationDocumentService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      declarations: [OtherAttachmentsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OtherAttachmentsComponent);
    component = fixture.componentInstance;
    component.$notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
    component.$notificationDocuments = documentPipe;

    mockCodeService.loadCodes.mockResolvedValue({
      localGovernments: [],
      applicationTypes: [],
      decisionMakers: [],
      documentTypes: [],
      naruSubtypes: [],
      noticeOfIntentTypes: [],
      regions: [],
      submissionTypes: [],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
