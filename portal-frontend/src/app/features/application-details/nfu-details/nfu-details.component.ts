import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';

@Component({
  selector: 'app-nfu-details[applicationSubmission]',
  templateUrl: './nfu-details.component.html',
  styleUrls: ['./nfu-details.component.scss'],
})
export class NfuDetailsComponent {
  @Input() applicationSubmission: ApplicationSubmissionDetailedDto | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;
  @Input() updatedFields: string[] = [];

  constructor(private router: Router) {}

  onEditSection(step: number) {
    if (this.draftMode) {
      this.router.navigateByUrl(`/alcs/application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    } else {
      this.router.navigateByUrl(`application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }
}
