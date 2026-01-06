import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationDto } from '../../../services/notification/notification.dto';
import { ToastService } from '../../../services/toast/toast.service';

import { ApplicantInfoComponent } from './applicant-info.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ApplicantInfoComponent', () => {
  let component: ApplicantInfoComponent;
  let fixture: ComponentFixture<ApplicantInfoComponent>;
  let mockAppDetailService: DeepMocked<NotificationDetailService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockAppDetailService = createMock();
    mockAppDetailService.$notification = new BehaviorSubject<NotificationDto | undefined>(undefined);
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ApplicantInfoComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [],
      providers: [
        { provide: NotificationDetailService, useValue: mockAppDetailService },
        { provide: ToastService, useValue: mockToastService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
