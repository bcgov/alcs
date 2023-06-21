import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-naru-input',
  templateUrl: './naru-input.component.html',
  styleUrls: ['./naru-input.component.scss'],
})
export class NaruInputComponent {
  @Input() form!: FormGroup;
}
