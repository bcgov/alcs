import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import {
  NOI_SUBMISSION_STATUS,
  NoticeOfIntentSubmissionDetailedDto,
} from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../services/toast/toast.service';
import { CustomStepperComponent } from '../../../shared/custom-stepper/custom-stepper.component';
import { OverlaySpinnerService } from '../../../shared/overlay-spinner/overlay-spinner.service';
import { scrollToElement } from '../../../shared/utils/scroll-helper';
import { AdditionalInformationComponent } from './additional-information/additional-information.component';
import { ChangeNoiTypeDialogComponent } from './change-noi-type-dialog/change-noi-type-dialog.component';
import { LandUseComponent } from './land-use/land-use.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { ParcelDetailsComponent } from './parcels/parcel-details.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
import { PfrsProposalComponent } from './proposal/pfrs/pfrs-proposal.component';
import { PofoProposalComponent } from './proposal/pofo/pofo-proposal.component';
import { RosoProposalComponent } from './proposal/roso/roso-proposal.component';
import { SubmitConfirmationDialogComponent } from './review-and-submit/submit-confirmation-dialog/submit-confirmation-dialog.component';
import { SelectGovernmentComponent } from './select-government/select-government.component';

export enum EditNoiSteps {
  Parcel = 0,
  PrimaryContact = 1,
  Government = 2,
  LandUse = 3,
  Proposal = 4,
  ExtraInfo = 5,
  Attachments = 6,
  ReviewAndSubmit = 7,
}

@Component({
  selector: 'app-edit-submission',
  templateUrl: './edit-submission.component.html',
  styleUrls: ['./edit-submission.component.scss'],
})
export class EditSubmissionComponent implements OnDestroy, AfterViewInit {
  fileId = '';

  $destroy = new Subject<void>();
  $noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
  $noiDocuments = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);
  noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;

  steps = EditNoiSteps;
  expandedParcelUuid?: string;
  showValidationErrors = false;
  isDeactivating = false;

  @ViewChild('cdkStepper') public customStepper!: CustomStepperComponent;

  @ViewChild(ParcelDetailsComponent) parcelDetailsComponent!: ParcelDetailsComponent;
  @ViewChild(PrimaryContactComponent) primaryContactComponent!: PrimaryContactComponent;
  @ViewChild(SelectGovernmentComponent) selectGovernmentComponent!: SelectGovernmentComponent;
  @ViewChild(LandUseComponent) landUseComponent!: LandUseComponent;
  @ViewChild(OtherAttachmentsComponent) otherAttachmentsComponent!: OtherAttachmentsComponent;
  @ViewChild(RosoProposalComponent) rosoProposalComponent!: RosoProposalComponent;
  @ViewChild(PofoProposalComponent) pofoProposalComponent!: PofoProposalComponent;
  @ViewChild(PfrsProposalComponent) pfrsProposalComponent!: PfrsProposalComponent;
  @ViewChild(AdditionalInformationComponent) rosoAdditionalInfoComponent!: AdditionalInformationComponent;

  constructor(
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService,
    private router: Router
  ) {
    this.expandedParcelUuid = undefined;

    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      this.noiSubmission = submission;
    });
  }

  ngAfterViewInit(): void {
    combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.paramMap])
      .pipe(takeUntil(this.$destroy))
      .subscribe(([queryParamMap, paramMap]) => {
        this.isDeactivating = false;

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
    await this.router.navigateByUrl(`/notice-of-intent/${this.fileId}`);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // this gets fired whenever applicant navigates away from edit page
  async canDeactivate(): Promise<Observable<boolean>> {
    if (!this.isDeactivating) {
      this.isDeactivating = true;

      try {
        await this.saveSubmission(this.customStepper.selectedIndex);
      } catch (e) {
        console.error('Failed to save application');
      }
    }

    return of(true);
  }

  async onStepChange() {
    // scrolls to top of page
    scrollToElement({ id: `siteLayout`, center: false });
  }

  async switchStep(index: number) {
    // navigation to url will cause step change based on the index (index starts from 0)
    // The save will be triggered using canDeactivate guard
    this.showValidationErrors = this.customStepper.selectedIndex === EditNoiSteps.ReviewAndSubmit;
    await this.router.navigateByUrl(`notice-of-intent/${this.fileId}/edit/${index}`);
  }

  async saveSubmission(step: number) {
    switch (step) {
      case EditNoiSteps.Parcel:
        await this.parcelDetailsComponent.onSave();
        break;
      case EditNoiSteps.PrimaryContact:
        await this.primaryContactComponent.onSave();
        break;
      case EditNoiSteps.Government:
        await this.selectGovernmentComponent.onSave();
        break;
      case EditNoiSteps.LandUse:
        await this.landUseComponent.onSave();
        break;
      case EditNoiSteps.Attachments:
        await this.otherAttachmentsComponent.onSave();
        break;
      case EditNoiSteps.Proposal:
        if (this.rosoProposalComponent) {
          await this.rosoProposalComponent.onSave();
        }
        if (this.pofoProposalComponent) {
          await this.pofoProposalComponent.onSave();
        }
        if (this.pfrsProposalComponent) {
          await this.pfrsProposalComponent.onSave();
        }
        break;
      case EditNoiSteps.ExtraInfo:
        if (this.rosoAdditionalInfoComponent) {
          await this.rosoAdditionalInfoComponent.onSave();
        }
        break;
      case EditNoiSteps.ReviewAndSubmit:
        //DO NOTHING
        break;
      default:
        this.toastService.showErrorToast('Error updating notice of intent.');
    }
  }

  async onDownloadPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      //TODO: Hook this up later
    }
  }

  onChangeSubmissionType() {
    if (this.noiSubmission) {
      this.dialog
        .open(ChangeNoiTypeDialogComponent, {
          panelClass: 'no-padding',
          disableClose: true,
          autoFocus: false,
          data: {
            submissionUuid: this.noiSubmission.uuid,
            submissionTypeCode: this.noiSubmission.typeCode,
          },
        })
        .beforeClosed()
        .subscribe((result) => {
          if (result) {
            this.loadSubmission(this.fileId, true);
          }
        });
    }
  }

  async onSubmit() {
    if (this.noiSubmission) {
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
    const submission = this.noiSubmission;
    if (submission) {
      const didSubmit = await this.noticeOfIntentSubmissionService.submitToAlcs(submission.uuid);
      if (didSubmit) {
        await this.router.navigateByUrl(`/notice-of-intent/${submission?.fileNumber}/edit/success`);
      }
    }
  }

  private async loadSubmission(fileId: string, reload = false) {
    if (!this.noiSubmission || reload) {
      this.overlayService.showSpinner();
      this.noiSubmission = await this.noticeOfIntentSubmissionService.getByFileId(fileId);
      this.fileId = fileId;

      if (this.noiSubmission?.status.code !== NOI_SUBMISSION_STATUS.IN_PROGRESS) {
        this.toastService.showErrorToast('Unable to edit Notice of Intent');
        await this.router.navigateByUrl(`/home`);
      }

      const documents = await this.noticeOfIntentDocumentService.getByFileId(fileId);
      if (documents) {
        this.$noiDocuments.next(documents);
      }

      this.$noiSubmission.next(this.noiSubmission);
      this.overlayService.hideSpinner();
    }
  }

  onParcelDetailsInitialized() {
    if (this.expandedParcelUuid && this.parcelDetailsComponent) {
      this.parcelDetailsComponent.openParcel(this.expandedParcelUuid);
      this.expandedParcelUuid = undefined;
    }
  }
}
