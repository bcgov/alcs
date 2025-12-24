import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'emptyColumn',
    standalone: false
})
export class TableColumnNoDataPipe implements PipeTransform {
  transform(value: any): any {
    return value !== null && value !== undefined && value !== '' ? value : '-';
  }
}