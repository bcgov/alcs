import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationDocumentService } from '../../../services/notification-document/notification-document.service';
import { NotificationSubmissionService } from '../../../services/notification-submission/notification-submission.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { NotificationParcelService } from '../../../services/notification-parcel/notification-parcel.service';
import { ViewNotificationSubmissionComponent } from './view-notification-submission.component';

describe('ViewNotificationSubmissionComponent', () => {
  let component: ViewNotificationSubmissionComponent;
  let fixture: ComponentFixture<ViewNotificationSubmissionComponent>;

  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockNotificationDocumentService: DeepMocked<NotificationDocumentService>;
  let mockNotificationParcelService: DeepMocked<NotificationParcelService>;
  let mockActivatedRoute: DeepMocked<any>;

  beforeEach(async () => {
    mockNotificationSubmissionService = createMock();
    mockNotificationDocumentService = createMock();
    mockActivatedRoute = createMock();
    mockNotificationParcelService = createMock();

    mockActivatedRoute.paramMap = new BehaviorSubject(new Map());

    await TestBed.configureTestingModule({
      declarations: [ViewNotificationSubmissionComponent],
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
          provide: NotificationParcelService,
          useValue: mockNotificationParcelService,
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewNotificationSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
