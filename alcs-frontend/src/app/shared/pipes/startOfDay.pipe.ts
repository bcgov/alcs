import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({ name: 'startOfDay' })
export class StartOfDayPipe implements PipeTransform {
  transform(value: Date | undefined | null): any {
    return value ? moment(value).startOf('day').toDate() : value;
  }
}
