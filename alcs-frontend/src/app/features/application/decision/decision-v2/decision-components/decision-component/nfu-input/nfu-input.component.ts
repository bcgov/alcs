import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NFU_SUBTYPES_OPTIONS, NFU_TYPES_OPTIONS } from '../../../../../proposal/nfu/nfu.component';

@Component({
  selector: 'app-nfu-input',
  templateUrl: './nfu-input.component.html',
  styleUrls: ['./nfu-input.component.scss'],
})
export class NfuInputComponent {
  @Input() form!: FormGroup;
  nfuTypeOptions = NFU_TYPES_OPTIONS;
  nfuSubTypeOptions = NFU_SUBTYPES_OPTIONS;
}
