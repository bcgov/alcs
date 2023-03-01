import { Pipe, PipeTransform } from '@angular/core';

export const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+$/;

@Pipe({
  name: 'emailValid',
})
export class EmailValidPipe implements PipeTransform {
  transform(email: string | null) {
    if (!email) {
      return true;
    }
    return emailRegex.test(email);
  }
}
