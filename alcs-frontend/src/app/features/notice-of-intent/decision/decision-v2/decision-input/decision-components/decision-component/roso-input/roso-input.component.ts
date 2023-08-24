import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-roso-input',
  templateUrl: './roso-input.component.html',
  styleUrls: ['./roso-input.component.scss'],
})
export class RosoInputComponent {
  @Input() form!: FormGroup;
}
