import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'booleanToString',
})
export class BooleanToStringPipe implements PipeTransform {
  transform(value: boolean | undefined | null): string {
    switch (value) {
      case true:
        return 'Yes';
      case false:
        return 'No';
      default:
        return '';
    }
  }
}
