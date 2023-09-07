import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { NotificationDocumentDto } from '../../../../services/notification-document/notification-document.dto';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import { StepComponent } from '../step.partial';

@Component({
  selector: 'app-review-and-submit',
  templateUrl: './review-and-submit.component.html',
  styleUrls: ['./review-and-submit.component.scss'],
})
export class ReviewAndSubmitComponent extends StepComponent implements OnInit, OnDestroy {
  @Input() $notificationDocuments!: BehaviorSubject<NotificationDocumentDto[]>;
  @Output() submit = new EventEmitter<void>();

  notificationSubmission: NotificationSubmissionDetailedDto | undefined;

  constructor(private router: Router, private toastService: ToastService) {
    super();
  }

  ngOnInit(): void {
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      this.notificationSubmission = submission;
    });
  }

  override async onNavigateToStep(step: number) {
    await this.router.navigateByUrl(`notification/${this.notificationSubmission?.fileNumber}/edit/${step}?errors=t`);
  }

  async onSubmitToAlcs() {
    if (this.notificationSubmission) {
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
    //TODO
  }
}
