import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationSubmissionService } from '../../../services/notification-submission/notification-submission.service';

import { ViewNotificationSubmissionComponent } from './view-notification-submission.component';

describe('ViewNotificationSubmissionComponent', () => {
  let component: ViewNotificationSubmissionComponent;
  let fixture: ComponentFixture<ViewNotificationSubmissionComponent>;

  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockActivatedRoute: DeepMocked<any>;

  beforeEach(async () => {
    mockNotificationSubmissionService = createMock();
    mockActivatedRoute = createMock();

    mockActivatedRoute.paramMap = new BehaviorSubject(new Map());

    await TestBed.configureTestingModule({
      declarations: [ViewNotificationSubmissionComponent],
      providers: [
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
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
