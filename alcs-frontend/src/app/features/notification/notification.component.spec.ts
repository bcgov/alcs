import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationDetailService } from '../../services/notification/notification-detail.service';
import { NotificationSubmissionStatusService } from '../../services/notification/notification-submission-status/notification-submission-status.service';
import { NotificationDto } from '../../services/notification/notification.dto';

import { NotificationComponent } from './notification.component';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let mockNotificationDetailService: DeepMocked<NotificationDetailService>;
  let mockNotificationStatusService: DeepMocked<NotificationSubmissionStatusService>;

  beforeEach(async () => {
    mockNotificationDetailService = createMock();
    mockNotificationDetailService.$notification = new BehaviorSubject<NotificationDto | undefined>(undefined);
    mockNotificationStatusService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationDetailService,
          useValue: mockNotificationDetailService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new EventEmitter(),
          },
        },
        {
          provide: NotificationSubmissionStatusService,
          useValue: mockNotificationStatusService,
        },
        {
          provide: Router,
          useValue: {},
        },
      ],
      declarations: [NotificationComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
