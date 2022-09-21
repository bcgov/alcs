import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'momentFormat' })
export class MomentPipe implements PipeTransform {
  transform(value: Date | moment.Moment | number, dateFormat = environment.dateFormat): any {
    return moment(value).format(dateFormat);
  }
}
