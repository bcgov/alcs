import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  @Output() dataChange = new EventEmitter<SoilTableData>();

  volume = new FormControl<string | null>(null, [Validators.required]);
  area = new FormControl<string | null>(null, [Validators.required]);
  maximumDepth = new FormControl<string | null>(null, [Validators.required]);
  averageDepth = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    volume: this.volume,
    area: this.area,
    maximumDepth: this.maximumDepth,
    averageDepth: this.averageDepth,
  });

  ngOnInit(): void {
    if (this.data) {
      this.volume.setValue(this.data.volume?.toString(10) ?? null);
      this.area.setValue(this.data.area?.toString(10) ?? null);
      this.maximumDepth.setValue(this.data.maximumDepth?.toString(10) ?? null);
      this.averageDepth.setValue(this.data.averageDepth?.toString(10) ?? null);
    }

    this.form.valueChanges.subscribe((changes) => {
      this.dataChange.emit({
        volume: this.volume.value ? parseFloat(this.volume.value) : undefined,
        area: this.area.value ? parseFloat(this.area.value) : undefined,
        maximumDepth: this.maximumDepth.value ? parseFloat(this.maximumDepth.value) : undefined,
        averageDepth: this.averageDepth.value ? parseFloat(this.averageDepth.value) : undefined,
      });
    });
  }
}
