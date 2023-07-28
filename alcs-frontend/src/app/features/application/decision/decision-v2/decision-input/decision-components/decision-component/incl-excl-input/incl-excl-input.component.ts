import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-incl-excl-input',
  templateUrl: './incl-excl-input.component.html',
  styleUrls: ['./incl-excl-input.component.scss'],
})
export class InclExclInputComponent {
  @Input() form!: FormGroup;
}
