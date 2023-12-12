import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { NotificationDocumentDto } from '../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../services/notification-document/notification-document.service';
import {
  NOTIFICATION_STATUS,
  NotificationSubmissionDetailedDto,
} from '../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../services/notification-submission/notification-submission.service';
import { ToastService } from '../../../services/toast/toast.service';
import { CustomStepperComponent } from '../../../shared/custom-stepper/custom-stepper.component';
import { OverlaySpinnerService } from '../../../shared/overlay-spinner/overlay-spinner.service';
import { scrollToElement } from '../../../shared/utils/scroll-helper';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { ParcelDetailsComponent } from './parcels/parcel-details.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
import { ProposalComponent } from './proposal/proposal.component';
import { SubmitConfirmationDialogComponent } from './review-and-submit/submit-confirmation-dialog/submit-confirmation-dialog.component';
import { SelectGovernmentComponent } from './select-government/select-government.component';

export enum EditNotificationSteps {
  Parcel = 0,
  Transferees = 1,
  PrimaryContact = 2,
  Government = 3,
  Proposal = 4,
  Attachments = 5,
  ReviewAndSubmit = 6,
}

@Component({
  selector: 'app-edit-submission',
  templateUrl: './edit-submission.component.html',
  styleUrls: ['./edit-submission.component.scss'],
})
export class EditSubmissionComponent implements OnDestroy, AfterViewInit {
  fileId = '';

  $destroy = new Subject<void>();
  $notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
  $notificationDocuments = new BehaviorSubject<NotificationDocumentDto[]>([]);
  notificationSubmission: NotificationSubmissionDetailedDto | undefined;

  steps = EditNotificationSteps;
  expandedParcelUuid?: string;
  showValidationErrors = false;

  @ViewChild('cdkStepper') public customStepper!: CustomStepperComponent;
  @ViewChild(ParcelDetailsComponent) parcelDetailsComponent!: ParcelDetailsComponent;
  @ViewChild(PrimaryContactComponent) primaryContactComponent!: PrimaryContactComponent;
  @ViewChild(SelectGovernmentComponent) selectGovernmentComponent!: SelectGovernmentComponent;
  @ViewChild(ProposalComponent) proposalComponent!: ProposalComponent;
  @ViewChild(OtherAttachmentsComponent) otherAttachmentsComponent!: OtherAttachmentsComponent;

  constructor(
    private notificationSubmissionService: NotificationSubmissionService,
    private notificationDocumentService: NotificationDocumentService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService,
    private router: Router
  ) {
    this.expandedParcelUuid = undefined;

    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      this.notificationSubmission = submission;
    });
  }

  ngAfterViewInit(): void {
    combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.paramMap])
      .pipe(takeUntil(this.$destroy))
      .subscribe(([queryParamMap, paramMap]) => {
        const fileId = paramMap.get('fileId');
        if (fileId) {
          this.loadSubmission(fileId).then(() => {
            const stepInd = paramMap.get('stepInd');
            const parcelUuid = queryParamMap.get('parcelUuid');
            const showErrors = queryParamMap.get('errors');
            if (showErrors) {
              this.showValidationErrors = showErrors === 't';
            }

            if (stepInd) {
              // setTimeout is required for stepper to be initialized
              setTimeout(() => {
                this.customStepper.navigateToStep(parseInt(stepInd), true);

                if (parcelUuid) {
                  this.expandedParcelUuid = parcelUuid;
                }
              });
            }
          });
        }
      });
  }

  async onExit() {
    await this.router.navigateByUrl(`/notification/${this.fileId}`);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // this gets fired whenever applicant navigates away from edit page
  async canDeactivate(): Promise<Observable<boolean>> {
    await this.saveSubmission(this.customStepper.selectedIndex);

    return of(true);
  }

  onStepChange($event: StepperSelectionEvent) {
    // scrolls to top of page
    scrollToElement({ id: `siteLayout`, center: false });
  }

  async switchStep(index: number) {
    // navigation to url will cause step change based on the index (index starts from 0)
    // The save will be triggered using canDeactivate guard
    this.showValidationErrors = this.customStepper.selectedIndex === EditNotificationSteps.ReviewAndSubmit;
    await this.router.navigateByUrl(`notification/${this.fileId}/edit/${index}`);
  }

  onParcelDetailsInitialized() {
    if (this.expandedParcelUuid && this.parcelDetailsComponent) {
      this.parcelDetailsComponent.openParcel(this.expandedParcelUuid);
      this.expandedParcelUuid = undefined;
    }
  }

  async saveSubmission(step: number) {
    switch (step) {
      case EditNotificationSteps.Parcel:
        if (this.parcelDetailsComponent) {
          await this.parcelDetailsComponent.onSave();
        }
        break;
      case EditNotificationSteps.Transferees:
        //DO NOTHING
        break;
      case EditNotificationSteps.PrimaryContact:
        if (this.primaryContactComponent) {
          await this.primaryContactComponent.onSave();
        }
        break;
      case EditNotificationSteps.Government:
        if (this.selectGovernmentComponent) {
          await this.selectGovernmentComponent.onSave();
        }
        break;
      case EditNotificationSteps.Proposal:
        if (this.proposalComponent) {
          await this.proposalComponent.onSave();
        }
        break;
      case EditNotificationSteps.Attachments:
        if (this.otherAttachmentsComponent) {
          await this.otherAttachmentsComponent.onSave();
        }
        break;
      case EditNotificationSteps.ReviewAndSubmit:
        //DO NOTHING
        break;
      default:
        this.toastService.showErrorToast('Error updating SRW.');
    }
  }

  async onSubmit() {
    if (this.notificationSubmission) {
      this.dialog
        .open(SubmitConfirmationDialogComponent)
        .beforeClosed()
        .subscribe((didConfirm) => {
          if (didConfirm) {
            this.submit();
          }
        });
    }
  }

  private async submit() {
    const submission = this.notificationSubmission;
    if (submission) {
      const didSubmit = await this.notificationSubmissionService.submitToAlcs(submission.uuid);
      if (didSubmit) {
        await this.router.navigateByUrl(`/notification/${submission?.fileNumber}/edit/success`);
      }
    }
  }

  private async loadSubmission(fileId: string, reload = false) {
    if (!this.notificationSubmission || reload) {
      this.overlayService.showSpinner();
      this.notificationSubmission = await this.notificationSubmissionService.getByFileId(fileId);
      this.fileId = fileId;

      if (this.notificationSubmission?.status.code !== NOTIFICATION_STATUS.IN_PROGRESS) {
        this.toastService.showErrorToast('Unable to edit Notification');
        await this.router.navigateByUrl(`/home`);
      }

      const documents = await this.notificationDocumentService.getByFileId(fileId);
      if (documents) {
        this.$notificationDocuments.next(documents);
      }

      this.$notificationSubmission.next(this.notificationSubmission);
      this.overlayService.hideSpinner();
    }
  }
}
