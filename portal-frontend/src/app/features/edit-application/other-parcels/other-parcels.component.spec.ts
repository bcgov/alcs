import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';

import { OtherParcelsComponent } from './other-parcels.component';

describe('OtherParcelsComponent', () => {
  let component: OtherParcelsComponent;
  let fixture: ComponentFixture<OtherParcelsComponent>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockMatDialog: DeepMocked<MatDialog>;
  let applicationPipe = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);

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
          provide: ApplicationService,
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
    component.$application = applicationPipe;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
