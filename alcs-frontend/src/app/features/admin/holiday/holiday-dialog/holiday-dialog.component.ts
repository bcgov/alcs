import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment-timezone';
import { HolidayService } from '../../../../services/stat-holiday/holiday.service';

export class HolidayForm {
  constructor(public name?: string, public day?: Date, public uuid?: string) {}
}

@Component({
  selector: 'app-holiday-dialog',
  templateUrl: './holiday-dialog.component.html',
  styleUrls: ['./holiday-dialog.component.scss'],
})
export class HolidayDialogComponent {
  title: string = 'Create';
  model: HolidayForm;

  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HolidayForm,
    private dialogRef: MatDialogRef<HolidayDialogComponent>,
    private holidayService: HolidayService
  ) {
    this.model = { ...data, day: data.day ? moment(data.day).tz('Canada/Pacific').toDate() : undefined };
    this.title = this.model.uuid ? 'Edit' : 'Create';
  }

  async onSubmit() {
    this.isLoading = true;

    if (this.model.uuid) {
      await this.holidayService.update(this.model.uuid, {
        name: this.model.name!,
        day: moment(this.model.day).toDate().getTime(),
      });
    } else {
      await this.holidayService.create({ name: this.model.name!, day: moment(this.model.day).toDate().getTime() });
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }
}
