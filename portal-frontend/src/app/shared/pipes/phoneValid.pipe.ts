import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneValid',
})
export class PhoneValidPipe implements PipeTransform {
  transform(phone: string | null) {
    if (!phone) {
      return true;
    }
    return phone.length === 10;
  }
}
