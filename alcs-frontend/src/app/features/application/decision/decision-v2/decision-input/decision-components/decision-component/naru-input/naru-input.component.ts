import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApplicationDecisionCodesDto } from '../../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-naru-input',
  templateUrl: './naru-input.component.html',
  styleUrls: ['./naru-input.component.scss'],
})
export class NaruInputComponent {
  @Input() form!: FormGroup;
  @Input() codes!: ApplicationDecisionCodesDto;
}
