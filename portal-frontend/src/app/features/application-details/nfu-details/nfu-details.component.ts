import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';

@Component({
  selector: 'app-nfu-details[application]',
  templateUrl: './nfu-details.component.html',
  styleUrls: ['./nfu-details.component.scss'],
})
export class NfuDetailsComponent {
  @Input() application: ApplicationSubmissionDetailedDto | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;

  constructor(private router: Router) {}

  onEditSection(step: number) {
    this.router.navigateByUrl(`application/${this.application?.fileNumber}/edit/${step}?errors=t`);
  }
}
