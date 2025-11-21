import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, first, skip } from 'rxjs';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
import { ComplianceAndEnforcementPropertyDto } from '../../../services/compliance-and-enforcement/property/property.dto';
import { PropertyComponent } from './property.component';

describe('PropertyComponent', () => {
  let component: PropertyComponent;
  let fixture: ComponentFixture<PropertyComponent>;
  let mockLocalGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockLocalGovernmentService = createMock();
    mockLocalGovernmentService.list.mockResolvedValue([]);
    mockApplicationService = createMock();
    mockApplicationService.$applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

    await TestBed.configureTestingModule({
      declarations: [PropertyComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatAutocompleteModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ApplicationLocalGovernmentService, useValue: mockLocalGovernmentService },
        { provide: ApplicationService, useValue: mockApplicationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form.get('ownershipTypeCode')?.value).toBe('SMPL');
    expect(component.form.get('pidOrPin')?.value).toBe('PID');
  });

  it('should set PID validation when PID is selected', () => {
    component.setPidOrPin('PID');
    expect(component.form.get('pid')?.hasError('required')).toBe(true);
    expect(component.form.get('pin')?.hasError('required')).toBe(false);
  });

  it('should set PIN validation when PIN is selected', () => {
    component.setPidOrPin('PIN');
    expect(component.form.get('pin')?.hasError('required')).toBe(true);
    expect(component.form.get('pid')?.hasError('required')).toBe(false);
  });

  it('should add property form to parent form', () => {
    const parentForm = new FormGroup({});
    component.parentForm = parentForm;
    expect(parentForm.contains('property')).toBe(true);
  });

  describe('Latitude/Longitude Validation', () => {
    it('should accept latitude with trailing zeros (49.00000)', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('49.00000');
      expect(latControl?.hasError('decimalPlaces')).toBe(false);
    });

    it('should accept longitude with trailing zeros (-130.00000)', () => {
      const longControl = component.form.get('longitude');
      longControl?.setValue('-130.00000');
      expect(longControl?.hasError('decimalPlaces')).toBe(false);
    });

    it('should accept latitude with trailing zero (49.99990)', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('49.99990');
      expect(latControl?.hasError('decimalPlaces')).toBe(false);
    });

    it('should accept integer latitude value (49)', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('49');
      expect(latControl?.hasError('decimalPlaces')).toBe(false);
    });

    it('should accept latitude with 5 decimal places (49.12345)', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('49.12345');
      expect(latControl?.hasError('decimalPlaces')).toBe(false);
    });

    it('should reject latitude with more than 5 decimal places (49.123456)', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('49.123456');
      expect(latControl?.hasError('decimalPlaces')).toBe(true);
    });

    it('should reject latitude below minimum (47)', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('47');
      expect(latControl?.hasError('min')).toBe(true);
    });

    it('should reject latitude above maximum (62)', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('62');
      expect(latControl?.hasError('max')).toBe(true);
    });

    it('should reject longitude below minimum (-141)', () => {
      const longControl = component.form.get('longitude');
      longControl?.setValue('-141');
      expect(longControl?.hasError('min')).toBe(true);
    });

    it('should reject longitude above maximum (-112)', () => {
      const longControl = component.form.get('longitude');
      longControl?.setValue('-112');
      expect(longControl?.hasError('max')).toBe(true);
    });

    it('should reject latitude with less than 5 decimal places (49.1)', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('49.1');
      expect(latControl?.hasError('decimalPlaces')).toBe(true);
    });

    it('should handle invalid number string in latitude', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('not-a-number');
      // Should not have decimalPlaces error (other validators handle it)
      expect(latControl?.hasError('decimalPlaces')).toBe(false);
    });

    it('should handle empty string in latitude', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('');
      expect(latControl?.hasError('decimalPlaces')).toBe(false);
    });
  });

  describe('Blur Handlers', () => {
    it('should format latitude on blur', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('49');
      component.onLatitudeBlur();
      expect(latControl?.value).toBe('49.00000');
    });

    it('should format longitude on blur', () => {
      const longControl = component.form.get('longitude');
      longControl?.setValue('-130');
      component.onLongitudeBlur();
      expect(longControl?.value).toBe('-130.00000');
    });

    it('should format latitude with decimals on blur', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('49.123');
      component.onLatitudeBlur();
      expect(latControl?.value).toBe('49.12300');
    });

    it('should not format latitude if value is null', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue(null);
      const initialValue = latControl?.value;
      component.onLatitudeBlur();
      expect(latControl?.value).toBe(initialValue);
    });

    it('should not format latitude if value is empty string', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('');
      component.onLatitudeBlur();
      expect(latControl?.value).toBe('');
    });

    it('should not format latitude if value is NaN', () => {
      const latControl = component.form.get('latitude');
      latControl?.setValue('invalid');
      component.onLatitudeBlur();
      expect(latControl?.value).toBe('invalid');
    });
  });

  describe('Local Government Selection', () => {
    beforeEach(() => {
      component.localGovernments = [
        {
          uuid: 'lg-1',
          name: 'Test City',
          preferredRegionCode: 'REGION-1',
        } as ApplicationLocalGovernmentDto,
        {
          uuid: 'lg-2',
          name: 'Another City',
          preferredRegionCode: 'REGION-2',
        } as ApplicationLocalGovernmentDto,
      ];
    });

    it('should set local government UUID and name on selection', () => {
      const event = {
        option: { value: 'lg-1' },
      } as MatAutocompleteSelectedEvent;

      component.onLocalGovernmentChange(event);

      expect(component.form.get('localGovernmentUuid')?.value).toBe('lg-1');
      expect(component.localGovernmentControl.value).toBe('Test City');
    });

    it('should auto-populate region code when local government has preferred region', () => {
      const event = {
        option: { value: 'lg-1' },
      } as MatAutocompleteSelectedEvent;

      component.onLocalGovernmentChange(event);

      expect(component.form.get('regionCode')?.value).toBe('REGION-1');
    });

    it('should handle local government without preferred region', () => {
      component.localGovernments = [
        {
          uuid: 'lg-3',
          name: 'No Region City',
        } as ApplicationLocalGovernmentDto,
      ];

      const event = {
        option: { value: 'lg-3' },
      } as MatAutocompleteSelectedEvent;

      component.onLocalGovernmentChange(event);

      expect(component.form.get('regionCode')?.value).toBe('');
    });

    it('should handle selection of non-existent local government', () => {
      const event = {
        option: { value: 'non-existent' },
      } as MatAutocompleteSelectedEvent;

      component.onLocalGovernmentChange(event);

      expect(component.form.get('localGovernmentUuid')?.value).toBe('');
    });
  });

  describe('PID/PIN Change Handler', () => {
    it('should call setPidOrPin when PID/PIN changes', () => {
      const setPidOrPinSpy = jest.spyOn(component, 'setPidOrPin');
      const event = { value: 'PIN' } as MatSelectChange;

      component.onPidOrPinChange(event);

      expect(setPidOrPinSpy).toHaveBeenCalledWith('PIN');
    });
  });

  describe('Form Initialization with Property', () => {
    const mockProperty: ComplianceAndEnforcementPropertyDto = {
      uuid: 'prop-1',
      fileUuid: 'file-1',
      civicAddress: '123 Test St',
      legalDescription: 'Test Description',
      localGovernmentUuid: 'lg-1',
      regionCode: 'REGION-1',
      latitude: 49.12345,
      longitude: -130.54321,
      ownershipTypeCode: 'SMPL',
      pid: '123456789',
      pin: null,
      areaHectares: 10.5,
      alrPercentage: 75.5,
      alcHistory: 'Test History',
    };

    beforeEach(() => {
      component.localGovernments = [
        {
          uuid: 'lg-1',
          name: 'Test City',
          preferredRegionCode: 'REGION-1',
        } as ApplicationLocalGovernmentDto,
      ];
    });

    it('should update form with property data', () => {
      component.property = mockProperty;
      fixture.detectChanges();

      expect(component.form.get('civicAddress')?.value).toBe('123 Test St');
      expect(component.form.get('legalDescription')?.value).toBe('Test Description');
      expect(component.form.get('localGovernmentUuid')?.value).toBe('lg-1');
      expect(component.form.get('regionCode')?.value).toBe('REGION-1');
      expect(component.form.get('latitude')?.value).toBe('49.12345');
      expect(component.form.get('longitude')?.value).toBe('-130.54321');
      expect(component.form.get('ownershipTypeCode')?.value).toBe('SMPL');
      expect(component.form.get('pid')?.value).toBe('123456789');
      expect(component.form.get('areaHectares')?.value).toBe(10.5);
      expect(component.form.get('alrPercentage')?.value).toBe(75.5);
      expect(component.form.get('alcHistory')?.value).toBe('Test History');
    });

    it('should set PID when property has PID', () => {
      component.property = mockProperty;
      fixture.detectChanges();

      expect(component.form.get('pidOrPin')?.value).toBe('PID');
    });

    it('should set PIN when property has PIN but no PID', () => {
      const propertyWithPin = {
        ...mockProperty,
        pid: undefined,
        pin: '987654321',
      };
      component.property = propertyWithPin;
      fixture.detectChanges();

      expect(component.form.get('pidOrPin')?.value).toBe('PIN');
    });

    it('should format latitude to 5 decimals when initializing', () => {
      const propertyWithUnformattedLat = {
        ...mockProperty,
        latitude: 49.1,
      };
      component.property = propertyWithUnformattedLat;
      fixture.detectChanges();

      expect(component.form.get('latitude')?.value).toBe('49.10000');
    });

    it('should handle null latitude/longitude', () => {
      const propertyWithNullCoords = {
        ...mockProperty,
        latitude: 0,
        longitude: 0,
      };
      component.property = propertyWithNullCoords;
      fixture.detectChanges();

      expect(component.form.get('latitude')?.value).toBeNull();
      expect(component.form.get('longitude')?.value).toBeNull();
    });

    it('should not update form if property is not set', () => {
      component.property = undefined;
      fixture.detectChanges();

      // Form should remain in default state
      expect(component.form.get('civicAddress')?.value).toBe('');
    });
  });

  describe('Local Government Filtering', () => {
    beforeEach(() => {
      component.localGovernments = [
        { uuid: '1', name: 'Vancouver' } as ApplicationLocalGovernmentDto,
        { uuid: '2', name: 'Victoria' } as ApplicationLocalGovernmentDto,
        { uuid: '3', name: 'Surrey' } as ApplicationLocalGovernmentDto,
      ];
    });

    it('should filter local governments by name', (done) => {
      component.filteredLocalGovernments.pipe(skip(1), first()).subscribe((filtered) => {
        expect(filtered.some((lg) => lg.name.toLowerCase().includes('van'))).toBe(true);
        done();
      });

      component.localGovernmentControl.setValue('van');
    });

    it('should return empty array if no local governments', () => {
      component.localGovernments = [];
      const result = component['filterLocalGovernments']('test');
      expect(result).toEqual([]);
    });

    it('should return all local governments for empty filter', () => {
      const result = component['filterLocalGovernments']('');
      expect(result.length).toBe(3);
    });
  });

  describe('Parsing Methods', () => {
    describe('parseLatLongOrNull', () => {
      it('should return null for null input', () => {
        const result = component['parseLatLongOrNull'](null);
        expect(result).toBeNull();
      });

      it('should return null for undefined input', () => {
        const result = component['parseLatLongOrNull'](undefined);
        expect(result).toBeNull();
      });

      it('should return null for zero', () => {
        const result = component['parseLatLongOrNull'](0);
        expect(result).toBeNull();
      });

      it('should return null for NaN', () => {
        const result = component['parseLatLongOrNull'](NaN);
        expect(result).toBeNull();
      });

      it('should format valid number to 5 decimals', () => {
        const result = component['parseLatLongOrNull'](49.123);
        expect(result).toBe('49.12300');
      });

      it('should format integer to 5 decimals', () => {
        const result = component['parseLatLongOrNull'](49);
        expect(result).toBe('49.00000');
      });

      it('should handle string number', () => {
        const result = component['parseLatLongOrNull']('49.12345');
        expect(result).toBe('49.12345');
      });
    });

    describe('parseNumberOrNull', () => {
      it('should return null for null input', () => {
        const result = component['parseNumberOrNull'](null);
        expect(result).toBeNull();
      });

      it('should return null for undefined input', () => {
        const result = component['parseNumberOrNull'](undefined);
        expect(result).toBeNull();
      });

      it('should return null for zero', () => {
        const result = component['parseNumberOrNull'](0);
        expect(result).toBeNull();
      });

      it('should return null for NaN', () => {
        const result = component['parseNumberOrNull'](NaN);
        expect(result).toBeNull();
      });

      it('should return number for valid input', () => {
        const result = component['parseNumberOrNull'](10.5);
        expect(result).toBe(10.5);
      });

      it('should handle string number', () => {
        const result = component['parseNumberOrNull']('10.5');
        expect(result).toBe(10.5);
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup on destroy', () => {
      const destroySpy = jest.spyOn(component.$destroy, 'next');
      const completeSpy = jest.spyOn(component.$destroy, 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Ownership Type Changes', () => {
    it('should update PID/PIN requirements when ownership type changes', () => {
      component.isPatching = false;
      component.isInitialized = true;

      component.form.get('ownershipTypeCode')?.setValue('CRWN');

      // Wait for valueChanges to trigger
      fixture.detectChanges();

      // Verify that PID/PIN validators were updated (no required error for Crown)
      expect(component.form.get('pid')?.hasError('required')).toBe(false);
      expect(component.form.get('pin')?.hasError('required')).toBe(false);
    });

    it('should not update PID/PIN requirements when patching', () => {
      component.isPatching = true;
      component.isInitialized = true;
      const initialPidValidators = component.form.get('pid')?.validator;

      component.form.get('ownershipTypeCode')?.setValue('CRWN');

      fixture.detectChanges();

      // Validators should remain unchanged when patching
      expect(component.form.get('pid')?.validator).toBe(initialPidValidators);
    });
  });

  describe('Local Government Blur Handler', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      component.localGovernments = [
        {
          uuid: 'lg-1',
          name: 'Vancouver',
          preferredRegionCode: 'REGION-1',
        } as ApplicationLocalGovernmentDto,
        {
          uuid: 'lg-2',
          name: 'Victoria',
        } as ApplicationLocalGovernmentDto,
      ];
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should match local government by name on blur', () => {
      component.localGovernmentControl.setValue('Vancouver');
      component.onLocalGovernmentBlur();

      jest.advanceTimersByTime(100);

      expect(component.form.get('localGovernmentUuid')?.value).toBe('lg-1');
      expect(component.localGovernmentControl.value).toBe('Vancouver');
    });

    it('should auto-populate region when matching government has preferred region', () => {
      component.localGovernmentControl.setValue('Vancouver');
      component.onLocalGovernmentBlur();

      jest.advanceTimersByTime(100);

      expect(component.form.get('regionCode')?.value).toBe('REGION-1');
    });

    it('should clear invalid local government input', () => {
      component.localGovernmentControl.setValue('Invalid City');
      component.onLocalGovernmentBlur();

      jest.advanceTimersByTime(100);

      expect(component.form.get('localGovernmentUuid')?.value).toBe('');
      expect(component.localGovernmentControl.value).toBe('');
    });

    it('should clear UUID when field is empty', () => {
      component.localGovernmentControl.setValue('');
      component.onLocalGovernmentBlur();

      jest.advanceTimersByTime(100);

      expect(component.form.get('localGovernmentUuid')?.value).toBe('');
    });

    it('should sync validation errors to local government control', () => {
      component.localGovernmentControl.setValue('Invalid City');
      component.onLocalGovernmentBlur();

      jest.advanceTimersByTime(100);

      // Set errors after blur clears invalid input
      component.form.get('localGovernmentUuid')?.setErrors({ required: true });
      component.onLocalGovernmentBlur();

      jest.advanceTimersByTime(100);

      expect(component.localGovernmentControl.errors).toEqual({ required: true });
    });

    it('should handle case-insensitive matching', () => {
      component.localGovernmentControl.setValue('vancouver');
      component.onLocalGovernmentBlur();

      jest.advanceTimersByTime(100);

      expect(component.form.get('localGovernmentUuid')?.value).toBe('lg-1');
    });
  });

  describe('updatePidPinRequirements', () => {
    it('should remove validators for Crown ownership', () => {
      component.form.get('ownershipTypeCode')?.setValue('CRWN');
      component['updatePidPinRequirements']('CRWN');

      expect(component.form.get('pid')?.hasError('required')).toBe(false);
      expect(component.form.get('pin')?.hasError('required')).toBe(false);
    });

    it('should set PID as required when PID is selected and not Crown', () => {
      component.form.get('pidOrPin')?.setValue('PID');
      component.form.get('ownershipTypeCode')?.setValue('SMPL');
      component['updatePidPinRequirements']('SMPL');

      expect(component.form.get('pid')?.hasError('required')).toBe(true);
      expect(component.form.get('pin')?.hasError('required')).toBe(false);
    });

    it('should set PIN as required when PIN is selected and not Crown', () => {
      component.form.get('pidOrPin')?.setValue('PIN');
      component.form.get('ownershipTypeCode')?.setValue('SMPL');
      component['updatePidPinRequirements']('SMPL');

      expect(component.form.get('pin')?.hasError('required')).toBe(true);
      expect(component.form.get('pid')?.hasError('required')).toBe(false);
    });
  });

  describe('setPidOrPin', () => {
    it('should clear validators for Crown ownership', () => {
      component.form.get('ownershipTypeCode')?.setValue('CRWN');
      component.setPidOrPin('PID');

      expect(component.form.get('pid')?.hasError('required')).toBe(false);
      expect(component.form.get('pin')?.hasError('required')).toBe(false);
    });

    it('should set PID validators and clear PIN when PID is selected', () => {
      component.form.get('ownershipTypeCode')?.setValue('SMPL');
      component.setPidOrPin('PID');

      expect(component.form.get('pid')?.hasError('required')).toBe(true);
      expect(component.form.get('pin')?.value).toBe('');
    });

    it('should set PIN validators and clear PID when PIN is selected', () => {
      component.form.get('ownershipTypeCode')?.setValue('SMPL');
      component.setPidOrPin('PIN');

      expect(component.form.get('pin')?.hasError('required')).toBe(true);
      expect(component.form.get('pid')?.value).toBe('');
    });
  });

  describe('Form Value Changes', () => {
    beforeEach(() => {
      component.isInitialized = true;
      component.isPatching = false;
      // Set a property to trigger subscription setup
      component.property = {
        uuid: 'test',
        fileUuid: 'test',
        civicAddress: '',
        legalDescription: '',
        localGovernmentUuid: '',
        regionCode: '',
        latitude: 0,
        longitude: 0,
        ownershipTypeCode: 'SMPL',
        areaHectares: 0,
        alrPercentage: 0,
        alcHistory: '',
      };
      fixture.detectChanges();
    });

    it('should emit changes when form values change', (done) => {
      // Skip initial empty emission
      component.$changes.pipe(skip(1), first()).subscribe((changes) => {
        expect(changes.civicAddress).toBe('New Address');
        done();
      });

      component.form.get('civicAddress')?.setValue('New Address');
      fixture.detectChanges();
    });

    it('should format latitude/longitude in emitted changes', (done) => {
      // Skip initial empty emission
      component.$changes.pipe(skip(1), first()).subscribe((changes) => {
        expect(changes.latitude).toBe(49.00000);
        done();
      });

      component.form.get('latitude')?.setValue('49');
      fixture.detectChanges();
    });

    it('should not emit changes when patching', () => {
      component.isPatching = true;
      const changesSpy = jest.spyOn(component.$changes, 'next');

      component.form.get('civicAddress')?.setValue('New Address');

      expect(changesSpy).not.toHaveBeenCalled();
    });

    it('should not emit changes when not initialized', () => {
      component.isInitialized = false;
      const changesSpy = jest.spyOn(component.$changes, 'next');

      component.form.get('civicAddress')?.setValue('New Address');

      expect(changesSpy).not.toHaveBeenCalled();
    });
  });
});
