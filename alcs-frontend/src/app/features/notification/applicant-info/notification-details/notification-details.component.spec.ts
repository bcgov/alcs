import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotificationDocumentService } from '../../../../services/notification/notification-document/notification-document.service';
import { NotificationSubmissionService } from '../../../../services/notification/notification-submission/notification-submission.service';
import {
  NOTIFICATION_STATUS,
  NotificationSubmissionStatusDto,
} from '../../../../services/notification/notification.dto';
import { ToastService } from '../../../../services/toast/toast.service';

import { NotificationDetailsComponent } from './notification-details.component';

describe('NotificationDetailsComponent', () => {
  let component: NotificationDetailsComponent;
  let fixture: ComponentFixture<NotificationDetailsComponent>;

  let mockDocumentService: DeepMocked<NotificationDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let mockToastService: DeepMocked<ToastService>;
  let mockSubmissionService: DeepMocked<NotificationSubmissionService>;

  beforeEach(async () => {
    mockDocumentService = createMock();
    mockRouter = createMock();
    mockSubmissionService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationDocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: NotificationSubmissionService,
          useValue: mockSubmissionService,
        },
      ],
      declarations: [NotificationDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationDetailsComponent);
    component = fixture.componentInstance;
    component.submission = {
      contactEmail: null,
      contactFirstName: null,
      contactLastName: null,
      contactOrganization: null,
      contactPhone: null,
      hasSurveyPlan: null,
      lastStatusUpdate: 0,
      submittersFileNumber: null,
      totalArea: null,
      transferees: [],
      fileNumber: '',
      uuid: '',
      createdAt: 1,
      updatedAt: 1,
      applicant: '',
      localGovernmentUuid: '',
      type: '',
      typeCode: '',
      status: {
        code: NOTIFICATION_STATUS.IN_PROGRESS,
        portalBackgroundColor: '',
        portalColor: '',
        label: '',
        description: '',
      } as NotificationSubmissionStatusDto,
      canEdit: false,
      canView: false,
      purpose: '',
    };
    component.fileNumber = 'fake';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
