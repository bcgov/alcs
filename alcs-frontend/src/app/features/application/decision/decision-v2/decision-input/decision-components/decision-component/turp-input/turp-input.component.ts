import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-turp-input',
  templateUrl: './turp-input.component.html',
  styleUrls: ['./turp-input.component.scss'],
})
export class TurpInputComponent {
  @Input() form!: FormGroup;
}
