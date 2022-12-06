import { Platform } from '@angular/cdk/platform';
import { NativeDateAdapter } from '@matheo/datepicker/core';
import moment from 'moment';

export class MatheoDatepickerFormatter extends NativeDateAdapter {
  constructor(matDateLocale: string, platform: Platform) {
    super(matDateLocale, platform);
  }

  override format(date: Date, displayFormat: string): string {
    return moment(date).format(displayFormat);
  }
}
