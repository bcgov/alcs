import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-validation-error',
    templateUrl: './validation-error.component.html',
    styleUrls: ['./validation-error.component.scss'],
    standalone: false
})
export class ValidationErrorComponent {
  @Input() errorClass = 'subtext error';
}
