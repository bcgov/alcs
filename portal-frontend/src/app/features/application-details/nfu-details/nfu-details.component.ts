import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';

@Component({
  selector: 'app-nfu-details[application]',
  templateUrl: './nfu-details.component.html',
  styleUrls: ['./nfu-details.component.scss'],
})
export class NfuDetailsComponent {
  @Input() application: ApplicationDetailedDto | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;

  constructor(private router: Router) {}

  onEditSection(step: number) {
    this.router.navigateByUrl(`application/${this.application?.fileNumber}/edit/${step}?errors=t`);
  }
}
