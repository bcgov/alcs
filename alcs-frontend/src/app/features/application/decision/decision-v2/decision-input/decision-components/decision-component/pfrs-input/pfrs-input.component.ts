import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pfrs-input',
  templateUrl: './pfrs-input.component.html',
  styleUrls: ['./pfrs-input.component.scss'],
})
export class PfrsInputComponent {
  @Input() form!: FormGroup;
}
