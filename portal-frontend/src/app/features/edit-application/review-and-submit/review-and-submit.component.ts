import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationProposalDetailedDto } from '../../../services/application/application-proposal.dto';
import { ApplicationProposalService } from '../../../services/application/application-proposal.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-review-and-submit',
  templateUrl: './review-and-submit.component.html',
  styleUrls: ['./review-and-submit.component.scss'],
})
export class ReviewAndSubmitComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() $application!: BehaviorSubject<ApplicationProposalDetailedDto | undefined>;
  private application: ApplicationProposalDetailedDto | undefined;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private applicationService: ApplicationProposalService
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((app) => {
      this.application = app;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onNavigateToStep(step: number) {
    this.router.navigateByUrl(`application/${this.application?.fileNumber}/edit/${step}?errors=t`);
  }

  async onSubmitToAlcs() {
    const el = document.getElementsByClassName('error');
    if (el && el.length > 0) {
      el[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      this.toastService.showErrorToast('Please correct all errors before submitting the form');
    } else if (this.application) {
      await this.applicationService.submitToAlcs(this.application.fileNumber);
      await this.router.navigateByUrl(`/application/${this.application?.fileNumber}`);
    }
  }

  async onSaveExit() {
    await this.router.navigateByUrl(`/application/${this.application?.fileNumber}`);
  }
}
