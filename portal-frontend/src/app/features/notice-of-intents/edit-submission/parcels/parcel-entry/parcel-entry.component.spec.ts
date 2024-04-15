import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../../services/application-parcel/application-parcel.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerDto } from '../../../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelDto } from '../../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.dto';
import { NoticeOfIntentParcelService } from '../../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { ParcelService } from '../../../../../services/parcel/parcel.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { ParcelEntryComponent } from './parcel-entry.component';
import { By } from '@angular/platform-browser';

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
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelEntryComponent);
    component = fixture.componentInstance;
    component.$owners = new BehaviorSubject<NoticeOfIntentOwnerDto[]>([]);
    component.parcel = mockParcel;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('No Parcel Selected', () => {
    let mockParcel: NoticeOfIntentParcelDto = {
      isConfirmedByApplicant: false,
      uuid: '',
      owners: [],
    };

    beforeEach(async () => {
      component.parcel = mockParcel;
      fixture.detectChanges();
    });

    it('should have disabled owner input by default', () => {
      expect(component.ownerInput.disabled).toBeTruthy();
    });

    it('should populate parcel values on successful search', async () => {
      component.parcelForm.patchValue({
        pidPin: 'pidPin',
        searchBy: 'pin',
      });

      mockParcelService.getByPin.mockResolvedValue({
        legalDescription: 'legalDescription',
        mapArea: 'mapArea',
        pin: 'pin',
        pid: 'pid',
      });
      fixture.detectChanges();

      await component.onSearch();

      const values = component.parcelForm.getRawValue();

      expect(values.pin).toEqual('pin');
      expect(values.pid).toEqual('pid');
      expect(values.legalDescription).toEqual('legalDescription');
      expect(values.mapArea).toEqual('mapArea');
    });

    it('should reset key form controls on reset', () => {
      component.parcelForm.patchValue({
        pidPin: 'pidPin',
        pid: 'pid',
        legalDescription: 'legalDescription',
        mapArea: 'mapArea',
        purchaseDate: 'purchaseDate',
        isFarm: 'isFarm',
        civicAddress: 'civicAddress',
      });

      component.onReset();

      const values = component.parcelForm.getRawValue();

      Object.values(values).forEach((value) => {
        expect(value).toBeFalsy();
      });
    });

    it('should prepare the form for fee simple input when crown input type selected', () => {
      component.onChangeParcelType({
        value: PARCEL_OWNERSHIP_TYPE.FEE_SIMPLE,
      } as any);

      expect(component.isCrownLand).toBeFalsy();
      expect(component.purchaseDate.disabled).toBeFalsy();
      expect(component.pid.hasValidator(Validators.required)).toBeTruthy();
    });

    it('should prepare the form for crown input when crown input type selected', () => {
      component.onChangeParcelType({
        value: PARCEL_OWNERSHIP_TYPE.CROWN,
      } as any);

      expect(component.isCrownLand).toBeTruthy();
      expect(component.purchaseDate.disabled).toBeTruthy();
      expect(component.pid.hasValidator(Validators.required)).toBeFalsy();
    });

    it('should set the pidPinPlaceholder when changing search by to PID', () => {
      component.onChangeSearchBy('pid');

      expect(component.pidPinPlaceholder).toEqual('Type 9 digit PID');
    });

    it('should set the pidPinPlaceholder when changing search by to PIN', () => {
      component.onChangeSearchBy('pin');

      expect(component.pidPinPlaceholder).toEqual('Type PIN');
    });
  });

  describe('Fee Simple', () => {
    let mockParcel: NoticeOfIntentParcelDto = {
      isConfirmedByApplicant: false,
      uuid: '',
      owners: [],
      ownershipTypeCode: PARCEL_OWNERSHIP_TYPE.FEE_SIMPLE,
    };

    beforeEach(async () => {
      component.parcel = mockParcel;
      fixture.detectChanges();
    });

    it('should have enabled owner input by default', () => {
      expect(component.ownerInput.disabled).toBeFalsy();
    });

    it('should have search placeholder to pid', () => {
      expect(component.pidPinPlaceholder).toEqual('Type 9 digit PID');
    });

    it('should require certificate of title', () => {
      expect(component.isCertificateOfTitleRequired).toBeTruthy();
    });

    it('should have search button disabled if no pid', () => {
      const button = fixture.debugElement.query(By.css('.lookup-search-button')).nativeElement;
      expect(component.pidPin.getRawValue()).toBe('');
      expect(button.disabled).toBeTruthy();
    });

    it('should have search button disabled if pid is invalid', () => {
      component.pidPin.setErrors({ invalid: true });
      const button = fixture.debugElement.query(By.css('.lookup-search-button')).nativeElement;
      expect(component.pidPin.valid).toBeFalsy();
      expect(button.disabled).toBeTruthy();
    });

    it('should have search button enabled if pid is valid', () => {
      component.parcelForm.controls.parcelType.setValue('SMPL');
      component.pidPin.setValue('123456789');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.lookup-search-button')).nativeElement;
      expect(component.pidPin.valid).toBeTruthy();
      expect(!component.parcelType.getRawValue()).toBeFalsy();
      expect(!component.pidPin.getRawValue()).toBeFalsy();
      expect(component.pidPin.invalid).toBeFalsy();
      expect(button.disabled).toBeFalsy();
    });
  });

  describe('Crown', () => {
    let mockParcel: NoticeOfIntentParcelDto = {
      isConfirmedByApplicant: false,
      uuid: '',
      owners: [],
      ownershipTypeCode: PARCEL_OWNERSHIP_TYPE.CROWN,
    };

    beforeEach(async () => {
      component.showErrors = true;
      component.parcel = mockParcel;
      fixture.detectChanges();
    });

    it('should have owner input enabled since crown is selected', () => {
      expect(component.ownerInput.disabled).toBeFalsy();
    });

    it('should have pidPin disabled for crown', () => {
      expect(component.pidPin.disabled).toBeTruthy();
    });

    it('should have purchaseDate disabled for crown', () => {
      expect(component.purchaseDate.disabled).toBeTruthy();
    });

    it('should mark all components touched when showErrors is true', () => {
      expect(component.parcelForm.touched).toBeTruthy();
      for (const control of Object.values(component.parcelForm.controls)) {
        expect(control.touched).toBeTruthy();
      }
    });

    it('should not require certificate of title', () => {
      expect(component.isCertificateOfTitleRequired).toBeFalsy();
    });
    
    it('should have search button disabled if no pid', () => {
      const button = fixture.debugElement.query(By.css('.lookup-search-button')).nativeElement;
      expect(component.pidPin.getRawValue()).toBe('');
      expect(button.disabled).toBeTruthy();
    });

    it('should have search button disabled if pid is invalid', () => {
      component.pidPin.setErrors({ invalid: true });
      const button = fixture.debugElement.query(By.css('.lookup-search-button')).nativeElement;
      expect(component.pidPin.valid).toBeFalsy();
      expect(button.disabled).toBeTruthy();
    });

    it('should have search button enabled if pid is valid', () => {
      component.isCrownLand = true;
      component.searchBy.setValue('pid');
      component.parcelForm.controls.parcelType.setValue('CRWN');
      component.pidPin.setValue('123456789');

      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.lookup-search-button')).nativeElement;
      expect(!component.parcelType.getRawValue()).toBeFalsy();
      expect(!component.pidPin.getRawValue()).toBeFalsy();
      expect(component.pidPin.invalid).toBeFalsy();
      expect(button.disabled).toBeFalsy();
    });
  });
});
