import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ParcelService } from '../../../../services/parcel/parcel.service';

@Component({
  selector: 'app-parcel-entry',
  templateUrl: './parcel-entry.component.html',
  styleUrls: ['./parcel-entry.component.scss'],
})
export class ParcelEntryComponent implements OnInit {
  // owners: ParcelOwnerDto[] = [];

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

  ngOnInit(): void {}

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
