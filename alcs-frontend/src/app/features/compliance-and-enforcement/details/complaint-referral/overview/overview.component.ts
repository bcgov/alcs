import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ComplianceAndEnforcementDto } from '../../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import moment from 'moment';

@Component({
  selector: 'app-compliance-and-enforcement-complaint-referral-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class ComplaintReferralOverviewComponent implements OnDestroy {
  $destroy = new Subject<void>();

  dateSubmitted?: string;
  initialSubmissionType?: string;
  allegedContraventionNarrative?: string;
  allegedActivity?: string;
  intakeNotes?: string;

  @Input()
  set file(file: ComplianceAndEnforcementDto | undefined) {
    if (file) {
      this.dateSubmitted = file.dateSubmitted ? moment(file.dateSubmitted).format('YYYY-MMM-DD') : undefined;
      this.initialSubmissionType = file.initialSubmissionType?.toString();
      this.allegedContraventionNarrative = file.allegedContraventionNarrative;
      this.allegedActivity = file.allegedActivity.map((activity) => activity.toString()).join(', ');
      this.intakeNotes = file.intakeNotes;
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
