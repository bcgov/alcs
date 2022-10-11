import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@matheo/datepicker';
import * as moment from 'moment';
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

  @ViewChild('datePicker') private datePicker!: MatDatepicker<any>;

  minimum: Date | undefined;

  @Output() save = new EventEmitter<number>();

  form!: FormGroup;

  isEditing = false;
  formattedDate = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (this.min) {
      this.minimum = new Date(this.min);
    }
    if (this.selectedValue) {
      this.formattedDate = moment(this.selectedValue).format(environment.dateFormat);
      this.form = this.fb.group({
        date: new Date(this.selectedValue),
      });
    } else {
      this.form = this.fb.group({
        date: undefined,
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.datePicker.open();
    }
  }

  onSave() {
    const selectedValue = this.form.get('date')!.value;
    const finalValue = formatDateForApi(selectedValue);
    this.save.emit(finalValue);
    this.isEditing = false;
  }

  ngOnChanges(): void {
    if (this.selectedValue && this.form) {
      this.formattedDate = moment(this.selectedValue).format(environment.dateFormat);
      this.form.patchValue({
        date: new Date(this.selectedValue),
      });
    }
  }
}
