import { Component, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import {
  ComplianceAndEnforcementPropertyDto,
  UpdateComplianceAndEnforcementPropertyDto,
} from '../../../services/compliance-and-enforcement/property/property.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationLocalGovernmentDto } from '../../../services/application/application-local-government/application-local-government.dto';
// Define ownership types locally for now
const PARCEL_OWNERSHIP_TYPE = {
  FEE_SIMPLE: 'SMPL',
  CROWN: 'CRWN',
};

// Define regions enum
const REGION = {
  ISLA: 'Island',
  INTR: 'Interior',
  KOOT: 'Kootenay',
  NRTH: 'North',
  OKAN: 'Okanagan',
  SOUL: 'South Coast',
} as const;

// Clean up the property update object to remove null, undefined, and empty strings, needed to save draft effectively
export function cleanPropertyUpdate(update: UpdateComplianceAndEnforcementPropertyDto): UpdateComplianceAndEnforcementPropertyDto {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(update)) {
    if (
      value !== null &&
      value !== undefined &&
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
export class PropertyComponent implements OnDestroy {
  $destroy = new Subject<void>();

  isPatching = false;
  isSubscribed = false;

  PARCEL_OWNERSHIP_TYPE = PARCEL_OWNERSHIP_TYPE;
  REGION = REGION;
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  filteredLocalGovernments: ApplicationLocalGovernmentDto[] = [];
  regions = Object.entries(REGION).map(([code, label]) => ({ code, label }));

  form = new FormGroup({
    civicAddress: new FormControl<string>('', [Validators.required]),
    legalDescription: new FormControl<string>('', [Validators.required]),
    localGovernmentUuid: new FormControl<string>('', [Validators.required]),
    regionCode: new FormControl<string>('', [Validators.required]),
    latitude: new FormControl<number | null>(null, [Validators.required, Validators.min(48), Validators.max(61)]),
    longitude: new FormControl<number | null>(null, [Validators.required, Validators.min(-140), Validators.max(-113)]),
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
      
      // Determine if PID or PIN is being used
      const pidOrPin = property.pid ? 'PID' : 'PIN';
      
      this.form.patchValue({
        civicAddress: property.civicAddress,
        legalDescription: property.legalDescription,
        localGovernmentUuid: property.localGovernmentUuid,
        regionCode: property.regionCode,
        latitude: Number(property.latitude),
        longitude: Number(property.longitude),
        ownershipTypeCode: property.ownershipTypeCode,
        pidOrPin: pidOrPin,
        pid: property.pid || '',
        pin: property.pin || '',
        areaHectares: Number(property.areaHectares),
        alrPercentage: Number(property.alrPercentage),
        alcHistory: property.alcHistory,
      });

      this.setPidOrPin(pidOrPin);

      this.form.enable();
      this.isPatching = false;
    }

    // Prevent resubscription
    if (!this.isSubscribed) {
      this.form.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((form) => {
        if (this.isPatching) {
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
          pid: form.pidOrPin === 'PID' ? form.pid : null,
          pin: form.pidOrPin === 'PIN' ? form.pin : null,
          areaHectares: toNumberOrUndefined(form.areaHectares),
          alrPercentage: toNumberOrUndefined(form.alrPercentage),
          alcHistory: form.alcHistory ?? '',
        }));
      });

      this.isSubscribed = true;
    }
  }

  constructor(private localGovernmentService: ApplicationLocalGovernmentService) {
    this.loadLocalGovernments();
  }

  async loadLocalGovernments() {
    this.localGovernments = await this.localGovernmentService.list();
    this.filteredLocalGovernments = this.localGovernments;
  }

  onLocalGovernmentChange(event: MatSelectChange) {
    const selectedGovernment = this.localGovernments.find(lg => lg.uuid === event.value);
    if (selectedGovernment) {
      // Auto-select region based on preferred region of the local government
      // This would need to be implemented based on the region selection pattern
    }
  }

  setPidOrPin(type: string) {
    this.isPatching = true;
    
    if (type === 'PID') {
      this.form.controls['pid'].setValidators([Validators.required]);
      this.form.controls['pin'].setValidators([]);
      this.form.controls['pin'].setValue('');
    } else {
      this.form.controls['pin'].setValidators([Validators.required]);
      this.form.controls['pid'].setValidators([]);
      this.form.controls['pid'].setValue('');
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
