import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationSubmissionStatusService } from '../../../services/notification/notification-submission-status/notification-submission-status.service';
import { NotificationTimelineService } from '../../../services/notification/notification-timeline/notification-timeline.service';
import { NotificationDto } from '../../../services/notification/notification.dto';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let mockNOIDetailService: DeepMocked<NotificationDetailService>;

  beforeEach(async () => {
    mockNOIDetailService = createMock();
    mockNOIDetailService.$notification = new BehaviorSubject<NotificationDto | undefined>(undefined);
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationDetailService,
          useValue: mockNOIDetailService,
        },
        {
          provide: NotificationTimelineService,
          useValue: {},
        },
        {
          provide: NotificationSubmissionStatusService,
          useValue: {},
        },
      ],
      declarations: [OverviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
