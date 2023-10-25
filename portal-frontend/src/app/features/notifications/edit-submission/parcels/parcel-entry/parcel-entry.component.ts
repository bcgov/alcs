import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../../services/application-parcel/application-parcel.dto';
import { NotificationParcelDto } from '../../../../../services/notification-parcel/notification-parcel.dto';
import { NotificationParcelService } from '../../../../../services/notification-parcel/notification-parcel.service';
import { ParcelService } from '../../../../../services/parcel/parcel.service';
import { ParcelEntryConfirmationDialogComponent } from './parcel-entry-confirmation-dialog/parcel-entry-confirmation-dialog.component';

export interface ParcelEntryFormData {
  uuid: string;
  legalDescription: string | undefined | null;
  mapArea: string | undefined | null;
  pin: string | undefined | null;
  pid: string | undefined | null;
  civicAddress: string | undefined | null;
  parcelType: string | undefined | null;
  isFarm: string | undefined | null;
  purchaseDate?: Date | null;
  crownLandOwnerType?: string | null;
  isConfirmedByApplicant: boolean;
}

@Component({
  selector: 'app-notification-parcel-entry[parcel][fileId][submissionUuid]',
  templateUrl: './parcel-entry.component.html',
  styleUrls: ['./parcel-entry.component.scss'],
})
export class ParcelEntryComponent implements OnInit {
  @Input() parcel!: NotificationParcelDto;
  @Input() fileId!: string;
  @Input() submissionUuid!: string;

  @Input() showErrors = false;
  @Input() _disabled = false;
  @Input() isDraft = false;

  @Input()
  public set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.onFormDisabled();
  }

  @Output() private onFormGroupChange = new EventEmitter<Partial<ParcelEntryFormData>>();
  @Output() private onSaveProgress = new EventEmitter<void>();

  searchBy = new FormControl<string | null>(null);
  isCrownLand: boolean | null = null;

  pidPin = new FormControl<string>('');
  legalDescription = new FormControl<string | null>(null, [Validators.required]);
  mapArea = new FormControl<string | null>(null, [Validators.required]);
  pid = new FormControl<string | null>(null, [Validators.required]);
  pin = new FormControl<string | null>(null);
  civicAddress = new FormControl<string | null>(null, [Validators.required]);
  parcelType = new FormControl<string | null>(null, [Validators.required]);
  parcelForm = new FormGroup({
    pidPin: this.pidPin,
    legalDescription: this.legalDescription,
    mapArea: this.mapArea,
    pin: this.pin,
    pid: this.pid,
    civicAddress: this.civicAddress,
    parcelType: this.parcelType,
    searchBy: this.searchBy,
  });
  pidPinPlaceholder = '';

  ownerInput = new FormControl<string | null>(null);

  PARCEL_OWNERSHIP_TYPES = PARCEL_OWNERSHIP_TYPE;
  maxPurchasedDate = new Date();

  constructor(
    private parcelService: ParcelService,
    private notificationParcelService: NotificationParcelService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupForm();
  }

  async onSearch() {
    let result;
    if (this.searchBy.getRawValue() === 'pin') {
      result = await this.parcelService.getByPin(this.pidPin.getRawValue()!);
    } else {
      result = await this.parcelService.getByPid(this.pidPin.getRawValue()!);
    }

    this.onReset();
    if (result) {
      this.legalDescription.setValue(result.legalDescription);
      this.mapArea.setValue(result.mapArea);

      if (result.pin) {
        this.pin.setValue(result.pin);
      }

      if (result.pid) {
        this.pid.setValue(result.pid);
      }

      this.emitFormChangeOnSearchActions();
    }
  }

  onReset() {
    this.parcelForm.controls.pidPin.reset();
    this.parcelForm.controls.pid.reset();
    this.parcelForm.controls.pin.reset();
    this.parcelForm.controls.legalDescription.reset();
    this.parcelForm.controls.mapArea.reset();
    this.parcelForm.controls.civicAddress.reset();

    this.emitFormChangeOnSearchActions();

    if (this.showErrors) {
      this.parcelForm.markAllAsTouched();
    }
  }

  private emitFormChangeOnSearchActions() {
    this.onFormGroupChange.emit({
      uuid: this.parcel.uuid,
      legalDescription: this.legalDescription.getRawValue(),
      mapArea: this.mapArea.getRawValue(),
      pin: this.pin.getRawValue(),
      pid: this.pid.getRawValue(),
    });
  }

  onChangeParcelType($event: MatButtonToggleChange) {
    const dirtyForm =
      this.legalDescription.value || this.mapArea.value || this.pid.value || this.pin.value || this.civicAddress.value;

    const changeParcelType = () => {
      if ($event.value === this.PARCEL_OWNERSHIP_TYPES.CROWN) {
        this.searchBy.setValue(null);
        this.pidPinPlaceholder = '';
        this.isCrownLand = true;
        this.pid.removeValidators([Validators.required]);
      } else {
        this.searchBy.setValue('pid');
        this.pidPinPlaceholder = 'Type 9 digit PID';
        this.isCrownLand = false;
        this.pid.addValidators([Validators.required]);
      }

      this.pid.updateValueAndValidity();
    };

    if (dirtyForm && this.isCrownLand !== null) {
      this.dialog
        .open(ParcelEntryConfirmationDialogComponent, {
          panelClass: 'no-padding',
          disableClose: true,
        })
        .beforeClosed()
        .subscribe(async (result) => {
          if (result) {
            this.onReset();
            return changeParcelType();
          } else {
            const newParcelType = this.parcelType.getRawValue();

            const prevParcelType =
              newParcelType === this.PARCEL_OWNERSHIP_TYPES.CROWN
                ? this.PARCEL_OWNERSHIP_TYPES.FEE_SIMPLE
                : this.PARCEL_OWNERSHIP_TYPES.CROWN;

            this.parcelType.setValue(prevParcelType);
          }
        });
    } else {
      return changeParcelType();
    }
  }

  private setupForm() {
    this.parcelForm.patchValue({
      legalDescription: this.parcel.legalDescription,
      mapArea: this.parcel.mapAreaHectares,
      pid: this.parcel.pid,
      pin: this.parcel.pin,
      civicAddress: this.parcel.civicAddress,
      parcelType: this.parcel.ownershipTypeCode,
    });

    this.isCrownLand = this.parcelType.value
      ? this.parcelType.getRawValue() === this.PARCEL_OWNERSHIP_TYPES.CROWN
      : null;

    if (this.isCrownLand) {
      this.pidPin.disable();
      this.pid.removeValidators([Validators.required]);
      this.pidPinPlaceholder = '';
    } else {
      this.pidPinPlaceholder = 'Type 9 digit PID';
    }

    if (this.showErrors) {
      this.parcelForm.markAllAsTouched();
    }

    this.parcelForm.valueChanges.subscribe((formData) => {
      if (!this.parcelForm.dirty) {
        return;
      }

      if ((this.isCrownLand && !this.searchBy.getRawValue()) || this.disabled) {
        this.pidPin.disable({
          emitEvent: false,
        });
      } else {
        this.pidPin.enable({
          emitEvent: false,
        });
      }

      return this.onFormGroupChange.emit({
        ...formData,
        uuid: this.parcel.uuid,
      });
    });
  }

  private onFormDisabled() {
    if (this._disabled) {
      this.parcelForm.disable();
      this.ownerInput.disable();
    } else {
      this.parcelForm.enable();
      this.ownerInput.enable();
    }
  }

  onChangeSearchBy(value: string) {
    if (value === 'pid') {
      this.pidPinPlaceholder = 'Type 9 digit PID';
    } else {
      this.pidPinPlaceholder = 'Type PIN';
    }
  }
}
