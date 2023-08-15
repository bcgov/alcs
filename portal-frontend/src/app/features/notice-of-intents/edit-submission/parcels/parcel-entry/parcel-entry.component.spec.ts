import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerDto } from '../../../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelDto } from '../../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.dto';
import { NoticeOfIntentParcelService } from '../../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { ParcelService } from '../../../../../services/parcel/parcel.service';
import { ParcelEntryComponent } from './parcel-entry.component';

describe('ParcelEntryComponent', () => {
  let component: ParcelEntryComponent;
  let fixture: ComponentFixture<ParcelEntryComponent>;
  let mockParcelService: DeepMocked<ParcelService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockNOIParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockNOIOwnerService: DeepMocked<NoticeOfIntentOwnerService>;
  let mockNOIDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  let mockParcel: NoticeOfIntentParcelDto = {
    isConfirmedByApplicant: false,
    uuid: '',
    owners: [],
  };

  beforeEach(async () => {
    mockParcelService = createMock();
    mockHttpClient = createMock();
    mockNOIParcelService = createMock();
    mockNOIOwnerService = createMock();
    mockNOIDocumentService = createMock();

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
          provide: NoticeOfIntentParcelService,
          useValue: mockNOIParcelService,
        },
        {
          provide: NoticeOfIntentOwnerService,
          useValue: mockNOIOwnerService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNOIDocumentService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelEntryComponent);
    component = fixture.componentInstance;
    component.$owners = new BehaviorSubject<NoticeOfIntentOwnerDto[]>([]);
    component.parcel = mockParcel;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
