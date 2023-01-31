import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ParcelService } from '../../../../services/parcel/parcel.service';

import { HttpClient } from '@angular/common/http';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ParcelEntryComponent } from './parcel-entry.component';
import { ApplicationParcelDto } from '../../../../services/application-parcel/application-parcel.dto';

describe('ParcelEntryComponent', () => {
  let component: ParcelEntryComponent;
  let fixture: ComponentFixture<ParcelEntryComponent>;
  let mockParcelService: DeepMocked<ParcelService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockParcel = {} as ApplicationParcelDto;

  beforeEach(async () => {
    mockParcelService = createMock();
    mockHttpClient = createMock();
    mockApplicationParcelService = createMock();

    await TestBed.configureTestingModule({
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelEntryComponent);
    component = fixture.componentInstance;
    component.parcel = mockParcel;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
