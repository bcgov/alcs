import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationOwnerDto } from '../../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../../services/application-owner/application-owner.service';
import { ApplicationParcelDto } from '../../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../../services/application-parcel/application-parcel.service';
import { ParcelService } from '../../../../../services/parcel/parcel.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { ParcelEntryComponent } from './parcel-entry.component';

describe('ParcelEntryComponent', () => {
  let component: ParcelEntryComponent;
  let fixture: ComponentFixture<ParcelEntryComponent>;
  let mockParcelService: DeepMocked<ParcelService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;

  let mockParcel: ApplicationParcelDto = {
    isConfirmedByApplicant: false,
    uuid: '',
    owners: [],
  };

  beforeEach(async () => {
    mockParcelService = createMock();
    mockHttpClient = createMock();
    mockApplicationParcelService = createMock();
    mockAppOwnerService = createMock();
    mockAppDocService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [ParcelEntryComponent],
      providers: [
        {
          provide: ParcelService,
          useValue: mockParcelService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationParcelService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelEntryComponent);
    component = fixture.componentInstance;
    component.$owners = new BehaviorSubject<ApplicationOwnerDto[]>([]);
    component.parcel = mockParcel;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
