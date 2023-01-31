import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import moment from 'moment';
import { environment } from '../../../environments/environment';
import { formatDateForApi } from '../utils/api-date-formatter';

@Component({
  selector: 'app-inline-datepicker',
  templateUrl: './inline-datepicker.component.html',
  styleUrls: ['./inline-datepicker.component.scss'],
})
export class InlineDatepickerComponent implements OnInit, OnChanges {
  @Input() selectedValue: number | undefined;
  @Input() min: Date | number | undefined;

  @Output() save = new EventEmitter<number>();
  @ViewChild('datePicker') private datePicker!: MatDatepicker<any>;

  date = new FormControl();
  minimum: Date | undefined;
  isEditing = false;
  formattedDate = '';

  constructor() {}

  ngOnInit(): void {
    if (this.min) {
      this.minimum = new Date(this.min);
    }
    if (this.selectedValue) {
      this.formattedDate = moment(this.selectedValue).format(environment.dateFormat);
      this.date.setValue(moment(this.selectedValue));
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.datePicker.open();
    }
  }

  onSave() {
    const finalValue = formatDateForApi(this.date.getRawValue());
    this.save.emit(finalValue);
    this.isEditing = false;
  }

  ngOnChanges(): void {
    if (this.selectedValue) {
      this.formattedDate = moment(this.selectedValue).format(environment.dateFormat);
      this.date.setValue(moment(this.selectedValue));
    }
  }
}
