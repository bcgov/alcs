import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'momentFormat' })
export class MomentPipe implements PipeTransform {
  transform(value: Date | moment.Moment | number, dateFormat: string): any {
    return moment(value).format(dateFormat);
  }
}
