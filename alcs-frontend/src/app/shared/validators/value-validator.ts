import { AbstractControl, ValidationErrors } from "@angular/forms";

export const NonZeroValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === 0) {
        return { nonZero: true };
    }
    return null;
}