import { Component, Input } from '@angular/core';
import { SubmittedApplicationDto } from '../../../../../services/application/application.dto';

@Component({
  selector: 'app-nfu-details[application]',
  templateUrl: './nfu-details.component.html',
  styleUrls: ['./nfu-details.component.scss'],
})
export class NfuDetailsComponent {
  @Input() application!: SubmittedApplicationDto;

  constructor() {}
}
