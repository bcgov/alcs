import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ParcelDto } from '../../../../services/parcel/parcel.dto';
import { ParcelService } from '../../../../services/parcel/parcel.service';

export interface ParcelEntryFormData {
  uuid: string;
  pidPin: string | undefined | null;
  legalDescription: string | undefined | null;
  mapArea: string | undefined | null;
  pin: string | undefined | null;
  pid: string | undefined | null;
}

@Component({
  selector: 'app-parcel-entry',
  templateUrl: './parcel-entry.component.html',
  styleUrls: ['./parcel-entry.component.scss'],
})
export class ParcelEntryComponent implements OnInit {
  @Output() private onFormGroupChange = new EventEmitter<Partial<ParcelEntryFormData>>();

  @Input()
  parcel!: ParcelDto;

  pidPin = new FormControl<string>('');
  legalDescription = new FormControl<string>('');
  mapArea = new FormControl<string>('');
  pin = new FormControl<string>('');
  pid = new FormControl<string>('');

  constructor(private parcelService: ParcelService) {}

  parcelForm = new FormGroup({
    pidPin: this.pidPin,
    legalDescription: this.legalDescription,
    mapArea: this.mapArea,
    pin: this.pin,
    pid: this.pid,
  });

  ngOnInit(): void {
    this.parcelForm.valueChanges.subscribe((formData) => {
      return this.onFormGroupChange.emit({ uuid: this.parcel.uuid || 'aa', ...formData });
    });

    this.parcelForm.patchValue({
      legalDescription: this.parcel.legalDescription,
      mapArea: this.parcel.mapAreaHectares,
      pid: this.parcel.PID,
      pin: this.parcel.PIN,
    });
  }

  async onSearch() {
    const result = await this.parcelService.getByPidPin(this.pidPin.getRawValue()!);
    if (result) {
      this.legalDescription.setValue(result.legalDescription);
      this.mapArea.setValue(result.mapArea);
      if (result.pin) {
        this.pin.setValue(result.pin);
      }
    }
  }

  onReset() {
    this.parcelForm.reset();
  }
}
