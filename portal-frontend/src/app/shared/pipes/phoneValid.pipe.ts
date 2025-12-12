import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phoneValid',
    standalone: false
})
export class PhoneValidPipe implements PipeTransform {
  transform(phone: string | null) {
    if (!phone) {
      return true;
    }
    return phone.length === 10;
  }
}
