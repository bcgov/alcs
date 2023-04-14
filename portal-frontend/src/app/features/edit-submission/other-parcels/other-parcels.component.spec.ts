import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { ToastService } from '../../../services/toast/toast.service';

import { OtherParcelsComponent } from './other-parcels.component';

describe('OtherParcelsComponent', () => {
  let component: OtherParcelsComponent;
  let fixture: ComponentFixture<OtherParcelsComponent>;
  let mockApplicationService: DeepMocked<ApplicationSubmissionService>;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockMatDialog: DeepMocked<MatDialog>;
  let applicationPipe = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockApplicationParcelService = createMock();
    mockToastService = createMock();
    mockHttpClient = createMock();
    mockMatDialog = createMock();

    await TestBed.configureTestingModule({
      declarations: [OtherParcelsComponent],
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationParcelService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OtherParcelsComponent);
    component = fixture.componentInstance;
    component.$applicationSubmission = applicationPipe;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
