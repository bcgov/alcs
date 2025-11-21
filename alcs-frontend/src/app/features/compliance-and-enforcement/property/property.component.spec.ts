import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
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
  });
});
