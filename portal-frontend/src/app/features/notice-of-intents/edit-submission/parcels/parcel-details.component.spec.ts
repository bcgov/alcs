import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { NoticeOfIntentOwnerService } from '../../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import { ParcelDetailsComponent } from './parcel-details.component';

describe('ParcelDetailsComponent', () => {
  let component: ParcelDetailsComponent;
  let fixture: ComponentFixture<ParcelDetailsComponent>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockNOIParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockNOIOwnerService: DeepMocked<NoticeOfIntentOwnerService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockMatDialog: DeepMocked<MatDialog>;
  let noiPipe = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);

  beforeEach(async () => {
    mockHttpClient = createMock();
    mockNOIParcelService = createMock();
    mockToastService = createMock();
    mockMatDialog = createMock();
    mockNOIOwnerService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelDetailsComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNOIParcelService,
        },
        {
          provide: NoticeOfIntentOwnerService,
          useValue: mockNOIOwnerService,
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
    component.$noiSubmission = noiPipe;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
