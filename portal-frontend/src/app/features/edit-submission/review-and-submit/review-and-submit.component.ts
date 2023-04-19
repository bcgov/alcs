import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationSubmissionDocumentGenerationService } from '../../../services/application-submission/application-submisison-document-generation/application-submission-document-generation.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { ToastService } from '../../../services/toast/toast.service';
import { StepComponent } from '../step.partial';

@Component({
  selector: 'app-review-and-submit',
  templateUrl: './review-and-submit.component.html',
  styleUrls: ['./review-and-submit.component.scss'],
})
export class ReviewAndSubmitComponent extends StepComponent implements OnInit, OnDestroy {
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Input() updatedFields: string[] = [];
  @Input() originalSubmissionUuid = '';

  applicationSubmission: ApplicationSubmissionDetailedDto | undefined;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private applicationService: ApplicationSubmissionService,
    private applicationSubmissionDocumentGenerationService: ApplicationSubmissionDocumentGenerationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((app) => {
      this.applicationSubmission = app;
    });
  }

  override onNavigateToStep(step: number) {
    if (this.draftMode) {
      this.router.navigateByUrl(`alcs/application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    } else {
      this.router.navigateByUrl(`application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  async onSubmitToAlcs() {
    const el = document.getElementsByClassName('error');
    if (el && el.length > 0) {
      el[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      this.toastService.showErrorToast('Please correct all errors before submitting the form');
    } else if (this.applicationSubmission) {
      await this.applicationService.submitToAlcs(this.applicationSubmission.uuid);
      await this.router.navigateByUrl(`/application/${this.applicationSubmission?.fileNumber}`);
    }
  }

  async onDownloadPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      await this.applicationSubmissionDocumentGenerationService.generate(fileNumber);
    }
  }
}
