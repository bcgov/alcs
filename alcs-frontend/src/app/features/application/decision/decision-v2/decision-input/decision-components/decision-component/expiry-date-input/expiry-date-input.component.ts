import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-expiry-date-input',
  templateUrl: './expiry-date-input.component.html',
  styleUrls: ['./expiry-date-input.component.scss'],
})
export class ExpiryDateInputComponent {
  @Input() form!: FormGroup;
}
