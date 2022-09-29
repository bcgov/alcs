import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'lessOneDay' })
export class LessOneDayPipe implements PipeTransform {
  transform(value: Date | undefined | null): any {
    return value ? moment(value).subtract(1, 'day').toDate() : value;
  }
}
