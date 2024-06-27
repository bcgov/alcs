import { AbstractControl, ValidationErrors } from '@angular/forms';
import validator from 'validator';

export const strictEmailValidator = (control: AbstractControl): ValidationErrors | null => {
  return !control.value || (isString(control.value) && validator.isEmail(control.value, { allow_display_name: true }))
    ? null
    : { email: true };
};

function isString(s: string) {
  return Object.prototype.toString.call(s) === '[object String]';
}
