import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil, Observable, map, startWith } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  ComplianceAndEnforcementPropertyDto,
  UpdateComplianceAndEnforcementPropertyDto,
} from '../../../services/compliance-and-enforcement/property/property.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationLocalGovernmentDto } from '../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';

// Define ownership types locally for now
const PARCEL_OWNERSHIP_TYPE = {
  FEE_SIMPLE: 'SMPL',
  CROWN: 'CRWN',
};


// Custom validator for exactly 5 decimal places as per SO request
function decimalPlacesValidator(decimals: number) {
  return (control: any) => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const stringValue = control.value.toString();
    const decimalPart = stringValue.split('.')[1];

    if (!decimalPart) {
      return { decimalPlaces: { requiredDecimals: decimals, actualDecimals: 0 } };
    }

    if (decimalPart.length !== decimals) {
      return { decimalPlaces: { requiredDecimals: decimals, actualDecimals: decimalPart.length } };
    }

    return null;
  };
}

// Clean up the property update object to remove null, undefined, and empty strings, needed to save draft effectively
export function cleanPropertyUpdate(update: UpdateComplianceAndEnforcementPropertyDto): UpdateComplianceAndEnforcementPropertyDto {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(update)) {
    if (
      value !== undefined &&
      // Allow null values for pid/pin so they can be cleared
      (value !== null || key === 'pid' || key === 'pin') &&
      // Filter out default values
      !(key === 'ownershipTypeCode' && value === 'SMPL')
    ) {
      cleaned[key] = value;
    }
  }
  // Always omit localGovernmentUuid if blank, null, or undefined
  if (cleaned.localGovernmentUuid === '' || cleaned.localGovernmentUuid === null || cleaned.localGovernmentUuid === undefined) {
    delete cleaned.localGovernmentUuid;
  }
  return cleaned;
}

function toNumberOrUndefined(val: any) {
  const num = Number(val);
  return isNaN(num) ? undefined : num;
}

@Component({
  selector: 'app-compliance-and-enforcement-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss'],
})
export class PropertyComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  isPatching = false;
  isSubscribed = false;
  isInitialized = false;

  PARCEL_OWNERSHIP_TYPE = PARCEL_OWNERSHIP_TYPE;
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  filteredLocalGovernments: Observable<ApplicationLocalGovernmentDto[]>;
  regions: ApplicationRegionDto[] = [];

  // Control for the autocomplete display value
  localGovernmentControl = new FormControl<string>('');

  form = new FormGroup({
    civicAddress: new FormControl<string>('', [Validators.required]),
    legalDescription: new FormControl<string>('', [Validators.required]),
    localGovernmentUuid: new FormControl<string>('', [Validators.required]),
    regionCode: new FormControl<string>('', [Validators.required]),
    latitude: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(48),
      Validators.max(61),
      decimalPlacesValidator(5)
    ]),
    longitude: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(-140),
      Validators.max(-113),
      decimalPlacesValidator(5)
    ]),
    ownershipTypeCode: new FormControl<string>(PARCEL_OWNERSHIP_TYPE.FEE_SIMPLE, [Validators.required]),
    pidOrPin: new FormControl<string>('PID'),
    pid: new FormControl<string>(''),
    pin: new FormControl<string>(''),
    areaHectares: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    alrPercentage: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]),
    alcHistory: new FormControl<string>('', [Validators.required]),
  });

  @Input() set parentForm(parentForm: FormGroup) {
    if (!parentForm || parentForm.contains('property')) {
      return;
    }

    parentForm.addControl('property', this.form);
  }

  $changes: BehaviorSubject<UpdateComplianceAndEnforcementPropertyDto> =
    new BehaviorSubject<UpdateComplianceAndEnforcementPropertyDto>({});

  @Input()
  set property(property: ComplianceAndEnforcementPropertyDto | undefined) {
    if (property) {
      this.isPatching = true;
      this.form.disable();

      // Default to PID if neither has been set as a value
      const pidOrPin = property.pin && !property.pid ? 'PIN' : 'PID';

      // Find the local government to display its name
      const lg = this.localGovernments.find(g => g.uuid === property.localGovernmentUuid);
      this.localGovernmentControl.setValue(lg?.name || '');

      this.form.patchValue({
        civicAddress: property.civicAddress,
        legalDescription: property.legalDescription,
        localGovernmentUuid: property.localGovernmentUuid,
        regionCode: property.regionCode,
        latitude: this.parseNumberOrNull(property.latitude),
        longitude: this.parseNumberOrNull(property.longitude),
        ownershipTypeCode: property.ownershipTypeCode,
        pidOrPin: pidOrPin,
        pid: property.pid || '',
        pin: property.pin || '',
        areaHectares: this.parseNumberOrNull(property.areaHectares),
        alrPercentage: this.parseNumberOrNull(property.alrPercentage),
        alcHistory: property.alcHistory,
      });

      this.setPidOrPin(pidOrPin);

      this.form.enable();
      this.isPatching = false;

    }

    // Prevent resubscription
    if (!this.isSubscribed) {
      this.form.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((form) => {
        if (this.isPatching || !this.isInitialized) {
          return;
        }

        this.$changes.next(cleanPropertyUpdate({
          civicAddress: form.civicAddress ?? '',
          legalDescription: form.legalDescription ?? '',
          localGovernmentUuid: form.localGovernmentUuid && form.localGovernmentUuid.trim() !== '' ? form.localGovernmentUuid : undefined,
          regionCode: form.regionCode ?? '',
          latitude: toNumberOrUndefined(form.latitude),
          longitude: toNumberOrUndefined(form.longitude),
          ownershipTypeCode: form.ownershipTypeCode ?? PARCEL_OWNERSHIP_TYPE.FEE_SIMPLE,
          pid: form.pidOrPin === 'PID' ? (form.pid || null) : null,
          pin: form.pidOrPin === 'PIN' ? (form.pin || null) : null,
          areaHectares: toNumberOrUndefined(form.areaHectares),
          alrPercentage: toNumberOrUndefined(form.alrPercentage),
          alcHistory: form.alcHistory ?? '',
        }));
      });

      // Watch for ownership type changes to update PID/PIN requirements
      this.form.get('ownershipTypeCode')?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((ownershipType) => {
        if (!this.isPatching && ownershipType) {
          this.updatePidPinRequirements(ownershipType);
        }
      });

      this.isSubscribed = true;
    }
  }

  constructor(
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationService: ApplicationService
  ) {
    // Initialize autocomplete filtering
    this.filteredLocalGovernments = this.localGovernmentControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterLocalGovernments(value || ''))
    );
  }

  ngOnInit(): void {
    this.loadLocalGovernments();

    // Load regions from application service
    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });

    // If no property is set initially, set initialized to true after a delay to allow for any initial setup
      if (!this.isInitialized) {
        this.isInitialized = true;
      }
  }

  async loadLocalGovernments() {
    try {
      this.localGovernments = await this.localGovernmentService.list();

      // Trigger the filter to update now that we have data
      this.localGovernmentControl.updateValueAndValidity();
    } catch (error) {
      console.error('Error loading local governments:', error);
    }
  }

  private filterLocalGovernments(value: string): ApplicationLocalGovernmentDto[] {
    if (!this.localGovernments) {
      return [];
    }

    const filterValue = value.toLowerCase();
    return this.localGovernments.filter(lg =>
      lg.name.toLowerCase().includes(filterValue)
    );
  }

  private parseNumberOrNull(value: any): number | null {
    // If value is null or undefined, return null
    if (value == null) {
      return null;
    }

    // Convert to number
    const numValue = Number(value);

    // If it's not a valid number, return null
    if (isNaN(numValue)) {
      return null;
    }

    // If the number is 0, treat it as null (empty)
    if (numValue === 0) {
      return null;
    }

    return numValue;
  }

  onLocalGovernmentChange(event: MatAutocompleteSelectedEvent) {
    const selectedGovernment = this.localGovernments.find(lg => lg.uuid === event.option.value);
    if (selectedGovernment) {
      // Set the form control value to the UUID
      this.form.get('localGovernmentUuid')?.setValue(selectedGovernment.uuid);

      // Set the display control to show the name
      this.localGovernmentControl.setValue(selectedGovernment.name);

      // Clear any validation errors since a valid selection was made
      this.localGovernmentControl.setErrors(null);

      // Auto-populate region based on preferred region of the local government
      if (selectedGovernment.preferredRegionCode) {
        this.form.get('regionCode')?.setValue(selectedGovernment.preferredRegionCode);
      }
    }
  }

  onLocalGovernmentBlur() {
    // Check if the typed value matches any government name
    setTimeout(() => {
      const typedValue = this.localGovernmentControl.value;
      if (typedValue) {
        const matchingGovernment = this.localGovernments.find(lg =>
          lg.name.toLowerCase() === typedValue.toLowerCase()
        );

        if (matchingGovernment) {
          this.form.get('localGovernmentUuid')?.setValue(matchingGovernment.uuid);
          this.localGovernmentControl.setValue(matchingGovernment.name);

          // Auto-populate region based on the matching government
          if (matchingGovernment.preferredRegionCode) {
            this.form.get('regionCode')?.setValue(matchingGovernment.preferredRegionCode);
          }
        } else {
          // Clear invalid inputs (could possibly be removed if we want to allow user to keep invalid typing)
          this.form.get('localGovernmentUuid')?.setValue('');
          this.localGovernmentControl.setValue('');
        }
      } else {
        // If field is empty, clear the UUID as well
        this.form.get('localGovernmentUuid')?.setValue('');
      }

      // Sync validation state from localGovernmentUuid to localGovernmentControl (needed for validation)
      const uuidControl = this.form.get('localGovernmentUuid');
      if (uuidControl?.errors) {
        this.localGovernmentControl.setErrors(uuidControl.errors);
      } else {
        this.localGovernmentControl.setErrors(null);
      }
      this.localGovernmentControl.markAsTouched();
    }, 100);
  }

  private updatePidPinRequirements(ownershipType: string) {
    const pidControl = this.form.get('pid');
    const pinControl = this.form.get('pin');
    const pidOrPinValue = this.form.get('pidOrPin')?.value;

    if (ownershipType === PARCEL_OWNERSHIP_TYPE.CROWN) {
      // For Crown ownership, PID/PIN is not required
      pidControl?.setValidators([]);
      pinControl?.setValidators([]);
    } else {
      // For other ownership types, set requirements based on selection
      if (pidOrPinValue === 'PID') {
        pidControl?.setValidators([Validators.required]);
        pinControl?.setValidators([]);
      } else {
        pinControl?.setValidators([Validators.required]);
        pidControl?.setValidators([]);
      }
    }

    pidControl?.updateValueAndValidity();
    pinControl?.updateValueAndValidity();
  }

  setPidOrPin(type: string) {
    this.isPatching = true;

    const ownershipType = this.form.get('ownershipTypeCode')?.value;

    if (ownershipType === PARCEL_OWNERSHIP_TYPE.CROWN) {
      // For Crown ownership, neither PID nor PIN is required
      this.form.controls['pid'].setValidators([]);
      this.form.controls['pin'].setValidators([]);
    } else {
      // For other ownership types, set requirements based on selection
      if (type === 'PID') {
        this.form.controls['pid'].setValidators([Validators.required]);
        this.form.controls['pin'].setValidators([]);
        this.form.controls['pin'].setValue('');
      } else {
        this.form.controls['pin'].setValidators([Validators.required]);
        this.form.controls['pid'].setValidators([]);
        this.form.controls['pid'].setValue('');
      }
    }

    this.form.controls['pid'].updateValueAndValidity();
    this.form.controls['pin'].updateValueAndValidity();

    this.isPatching = false;
  }

  onPidOrPinChange(event: MatSelectChange) {
    this.setPidOrPin(event.value);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
