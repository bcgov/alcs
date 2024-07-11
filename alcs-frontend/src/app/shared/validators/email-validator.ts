import { AbstractControl, ValidationErrors } from '@angular/forms';
import validator from 'validator';

const isString = (s: string) => {
  return Object.prototype.toString.call(s) === '[object String]';
};

const isEmail = (s: string) => {
  return isString(s) && validator.isEmail(s, { allow_display_name: true });
};

export const strictEmailValidator = (control: AbstractControl): ValidationErrors | null => {
  return !control.value || isEmail(control.value) ? null : { email: true };
};

export const strictEmailListValidator = (control: AbstractControl): ValidationErrors | null => {
  return !control.value || control.value.every(isEmail) ? null : { email: true };
};
