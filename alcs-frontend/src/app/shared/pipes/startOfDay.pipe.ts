import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'startOfDay' })
export class StartOfDayPipe implements PipeTransform {
  transform(value: Date | undefined | null): any {
    return value ? moment(value).startOf('day').toDate() : value;
  }
}
