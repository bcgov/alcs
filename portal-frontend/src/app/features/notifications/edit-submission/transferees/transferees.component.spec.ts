import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';
import { NotificationTransfereeService } from '../../../../services/notification-transferee/notification-transferee.service';

import { TransfereesComponent } from './transferees.component';

describe('TransfereesComponent', () => {
  let component: TransfereesComponent;
  let fixture: ComponentFixture<TransfereesComponent>;
  let mockTransfereeService: DeepMocked<NotificationTransfereeService>;
  let mockNotificationService: DeepMocked<NotificationSubmissionService>;

  beforeEach(async () => {
    mockTransfereeService = createMock();
    mockNotificationService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationTransfereeService,
          useValue: mockTransfereeService,
        },
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [TransfereesComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TransfereesComponent);
    component = fixture.componentInstance;
    component.$notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
