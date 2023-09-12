import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationDocumentService } from '../../../services/notification/notification-document/notification-document.service';
import { NotificationDto } from '../../../services/notification/notification.dto';
import { ToastService } from '../../../services/toast/toast.service';

import { NotificationDocumentsComponent } from './documents.component';

describe('NotificationDocumentsComponent', () => {
  let component: NotificationDocumentsComponent;
  let fixture: ComponentFixture<NotificationDocumentsComponent>;
  let mockNotificationDocumentService: DeepMocked<NotificationDocumentService>;
  let mockNotificationDetailService: DeepMocked<NotificationDetailService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockNotificationDocumentService = createMock();
    mockNotificationDetailService = createMock();
    mockDialog = createMock();
    mockToastService = createMock();
    mockNotificationDetailService.$notification = new BehaviorSubject<NotificationDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [NotificationDocumentsComponent],
      providers: [
        {
          provide: NotificationDocumentService,
          useValue: mockNotificationDocumentService,
        },
        {
          provide: NotificationDetailService,
          useValue: mockNotificationDetailService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
