import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationProposalDetailedDto } from '../../../services/application/application-proposal.dto';

@Component({
  selector: 'app-nfu-details[application]',
  templateUrl: './nfu-details.component.html',
  styleUrls: ['./nfu-details.component.scss'],
})
export class NfuDetailsComponent {
  @Input() application: ApplicationProposalDetailedDto | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;

  constructor(private router: Router) {}

  onEditSection(step: number) {
    this.router.navigateByUrl(`application/${this.application?.fileNumber}/edit/${step}?errors=t`);
  }
}
