import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationParcelService } from '../../../../services/notification-parcel/notification-parcel.service';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import { ParcelDetailsComponent } from './parcel-details.component';

describe('ParcelDetailsComponent', () => {
  let component: ParcelDetailsComponent;
  let fixture: ComponentFixture<ParcelDetailsComponent>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockParcelService: DeepMocked<NotificationParcelService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockMatDialog: DeepMocked<MatDialog>;
  let notificationPipe = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);

  beforeEach(async () => {
    mockHttpClient = createMock();
    mockParcelService = createMock();
    mockToastService = createMock();
    mockMatDialog = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelDetailsComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: NotificationParcelService,
          useValue: mockParcelService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelDetailsComponent);
    component = fixture.componentInstance;
    component.$notificationSubmission = notificationPipe;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
