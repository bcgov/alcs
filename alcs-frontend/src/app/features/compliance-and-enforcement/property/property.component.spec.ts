import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';
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
});
