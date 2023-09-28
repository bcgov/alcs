import { Pipe, PipeTransform } from '@angular/core';

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/;

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
