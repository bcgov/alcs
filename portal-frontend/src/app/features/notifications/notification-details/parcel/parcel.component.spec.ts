import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationParcelService } from '../../../../services/notification-parcel/notification-parcel.service';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { ParcelComponent } from './parcel.component';

describe('ParcelComponent', () => {
  let component: ParcelComponent;
  let fixture: ComponentFixture<ParcelComponent>;

  let mockNotificationParcelService: DeepMocked<NotificationParcelService>;

  beforeEach(async () => {
    mockNotificationParcelService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelComponent],
      providers: [
        {
          provide: NotificationParcelService,
          useValue: mockNotificationParcelService,
        },
        {
          provides: Router,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelComponent);
    component = fixture.componentInstance;
    component.$notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
