import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-app-pofo-input',
  templateUrl: './pofo-input.component.html',
  styleUrls: ['./pofo-input.component.scss'],
})
export class PofoInputComponent {
  @Input() form!: FormGroup;
}
