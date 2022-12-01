import { DateAdapter } from '@angular/material/core';
import { NativeDatetimeAdapter } from '@ng-matero/extensions/core';
import moment from 'moment';

export class ExtensionsDatepickerFormatter extends NativeDatetimeAdapter {
  constructor(matDateLocale: string, _delegate: DateAdapter<Date>) {
    super(matDateLocale, _delegate);
  }

  override format(date: Date, displayFormat: string): string {
    return moment(date).format(displayFormat);
  }
}
