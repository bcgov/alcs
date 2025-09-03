import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ComplianceAndEnforcementDto } from '../../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import moment from 'moment';
import { ComplianceAndEnforcementSubmitterDto } from '../../../../../services/compliance-and-enforcement/submitter/submitter.dto';

@Component({
  selector: 'app-compliance-and-enforcement-complaint-referral-submitters',
  templateUrl: './submitters.component.html',
  styleUrls: ['./submitters.component.scss'],
})
export class ComplaintReferralSubmittersComponent implements OnDestroy {
  $destroy = new Subject<void>();

  submitters: ComplianceAndEnforcementSubmitterDto[] = [];

  @Input()
  set file(file: ComplianceAndEnforcementDto | undefined) {
    if (file) {
      this.submitters = file.submitters;
    }
  }

  formatDate(date: number | null): string | undefined {
    return date ? moment(date).format('YYYY-MMM-DD') : undefined;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
