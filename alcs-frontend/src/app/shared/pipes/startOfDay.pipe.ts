import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
    name: 'startOfDay',
    standalone: false
})
export class StartOfDayPipe implements PipeTransform {
  transform(value: Date | undefined | null): any {
    return value ? moment(value).startOf('day').toDate() : value;
  }
}
