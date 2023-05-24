import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'momentFormat' })
export class MomentPipe implements PipeTransform {
  transform(value: Date | moment.Moment | number | undefined, dateFormat = environment.dateFormat): any {
    return value ? moment(value).format(dateFormat) : '-';
  }
}
