import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { PdfGenerationService } from '../../../../services/pdf-generation/pdf-generation.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { StepComponent } from '../step.partial';

@Component({
  selector: 'app-review-and-submit',
  templateUrl: './review-and-submit.component.html',
  styleUrls: ['./review-and-submit.component.scss'],
})
export class ReviewAndSubmitComponent extends StepComponent implements OnInit, OnDestroy {
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Input() originalSubmissionUuid = '';
  @Output() submit = new EventEmitter<void>();

  applicationSubmission: ApplicationSubmissionDetailedDto | undefined;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private pdfGenerationService: PdfGenerationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      this.applicationSubmission = submission;
    });
  }

  override async onNavigateToStep(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `alcs/application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`
      );
    } else {
      await this.router.navigateByUrl(`application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  async onSubmitToAlcs() {
    if (this.applicationSubmission) {
      const el = document.getElementsByClassName('error');
      if (el && el.length > 0) {
        el[0].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        this.toastService.showErrorToast('Please correct all errors before submitting the form');
      } else {
        this.submit.emit();
      }
    }
  }

  async onDownloadPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      await this.pdfGenerationService.generateSubmission(fileNumber);
    }
  }
}
