import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, NgModel, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

export function codeExistsValidator(existingCodes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const inputValue = control.value.toLowerCase();
    if (existingCodes.some((code) => code.toLowerCase() === inputValue)) {
      return { codeExists: true };
    }
    return null;
  };
}

export function descriptionExistsValidator(existingDescriptions: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const inputValue = control.value.toLowerCase();
    if (existingDescriptions.some((description) => description.toLowerCase() === inputValue)) {
      return { descriptionExists: true };
    }
    return null;
  };
}

export function codeExistsDirectiveValidator(model: NgModel, existingCodes: string[], code: string) {
  const existingErrors = model.control.errors || {};
  const isExisting = existingCodes.includes(code.toLowerCase());

  if (isExisting) {
    model.control.setErrors({ ...existingErrors, codeExists: true });
  } else {
    delete existingErrors['codeExists'];
    model.control.setErrors(Object.keys(existingErrors).length ? existingErrors : null);
  }

  return isExisting;
}
