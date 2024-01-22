import { Component, Input } from '@angular/core';
import { PublicNotificationSubmissionDto } from '../../../../../services/public/public-notification.dto';

@Component({
  selector: 'app-proposal-details[submission]',
  templateUrl: './proposal-details.component.html',
  styleUrls: ['./proposal-details.component.scss'],
})
export class ProposalDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;

  @Input() submission: PublicNotificationSubmissionDto | undefined;
}
