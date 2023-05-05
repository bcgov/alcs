import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';

export type SoilTableData = {
  volume?: number;
  area?: number;
  maximumDepth?: number;
  averageDepth?: number;
};

@Component({
  selector: 'app-soil-table',
  templateUrl: './soil-table.component.html',
  styleUrls: ['./soil-table.component.scss'],
})
export class SoilTableComponent implements OnInit {
  @Input() tableHeader = 'Soil to be Removed';
  @Input() data?: SoilTableData;
  @Input() tableHeader2?: string | undefined;
  @Input() data2?: SoilTableData;

  @Output() dataChange = new EventEmitter<SoilTableData>();
  @Output() data2Change = new EventEmitter<SoilTableData>();

  volume = new FormControl<string | null>(null, [Validators.required]);
  area = new FormControl<string | null>(null, [Validators.required]);
  maximumDepth = new FormControl<string | null>(null, [Validators.required]);
  averageDepth = new FormControl<string | null>(null, [Validators.required]);

  volume2 = new FormControl<string | null>(null, [Validators.required]);
  area2 = new FormControl<string | null>(null, [Validators.required]);
  maximumDepth2 = new FormControl<string | null>(null, [Validators.required]);
  averageDepth2 = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    volume: this.volume,
    area: this.area,
    maximumDepth: this.maximumDepth,
    averageDepth: this.averageDepth,
    volume2: this.volume2,
    area2: this.area2,
    maximumDepth2: this.maximumDepth2,
    averageDepth2: this.averageDepth2,
  });

  ngOnInit(): void {
    if (this.data) {
      this.volume.setValue(this.data.volume?.toString(10) ?? null);
      this.area.setValue(this.data.area?.toString(10) ?? null);
      this.maximumDepth.setValue(this.data.maximumDepth?.toString(10) ?? null);
      this.averageDepth.setValue(this.data.averageDepth?.toString(10) ?? null);
    }

    if (this.data2) {
      this.volume2.setValue(this.data2.volume?.toString(10) ?? null);
      this.area2.setValue(this.data2.area?.toString(10) ?? null);
      this.maximumDepth2.setValue(this.data2.maximumDepth?.toString(10) ?? null);
      this.averageDepth2.setValue(this.data2.averageDepth?.toString(10) ?? null);
    }

    this.form.valueChanges.subscribe((changes) => {
      this.dataChange.emit({
        volume: this.volume.value ? parseFloat(this.volume.value) : undefined,
        area: this.area.value ? parseFloat(this.area.value) : undefined,
        maximumDepth: this.maximumDepth.value ? parseFloat(this.maximumDepth.value) : undefined,
        averageDepth: this.averageDepth.value ? parseFloat(this.averageDepth.value) : undefined,
      });

      this.data2Change.emit({
        volume: this.volume2.value ? parseFloat(this.volume2.value) : undefined,
        area: this.area2.value ? parseFloat(this.area2.value) : undefined,
        maximumDepth: this.maximumDepth2.value ? parseFloat(this.maximumDepth2.value) : undefined,
        averageDepth: this.averageDepth2.value ? parseFloat(this.averageDepth2.value) : undefined,
      });
    });
  }
}
