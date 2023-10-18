import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDraftService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission-draft.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../services/toast/toast.service';
import { CustomStepperComponent } from '../../../shared/custom-stepper/custom-stepper.component';
import { OverlaySpinnerService } from '../../../shared/overlay-spinner/overlay-spinner.service';
import { scrollToElement } from '../../../shared/utils/scroll-helper';
import { AdditionalInformationComponent } from '../edit-submission/additional-information/additional-information.component';
import { EditNoiSteps } from '../edit-submission/edit-submission.component';
import { LandUseComponent } from '../edit-submission/land-use/land-use.component';
import { OtherAttachmentsComponent } from '../edit-submission/other-attachments/other-attachments.component';
import { ParcelDetailsComponent } from '../edit-submission/parcels/parcel-details.component';
import { PrimaryContactComponent } from '../edit-submission/primary-contact/primary-contact.component';
import { PfrsProposalComponent } from '../edit-submission/proposal/pfrs/pfrs-proposal.component';
import { PofoProposalComponent } from '../edit-submission/proposal/pofo/pofo-proposal.component';
import { RosoProposalComponent } from '../edit-submission/proposal/roso/roso-proposal.component';
import { SelectGovernmentComponent } from '../edit-submission/select-government/select-government.component';
import { ConfirmPublishDialogComponent } from './confirm-publish-dialog/confirm-publish-dialog.component';

@Component({
  selector: 'app-alcs-edit-submission',
  templateUrl: './alcs-edit-submission.component.html',
  styleUrls: ['./alcs-edit-submission.component.scss'],
})
export class AlcsEditSubmissionComponent implements OnInit, OnDestroy, AfterViewInit {
  fileId = '';
  documents: NoticeOfIntentDocumentDto[] = [];

  $destroy = new Subject<void>();
  $noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
  $noiDocuments = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);
  noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;

  steps = EditNoiSteps;
  expandedParcelUuid?: string;

  showValidationErrors = false;

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
    private noticeOfIntentSubmissionDraftService: NoticeOfIntentSubmissionDraftService,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.expandedParcelUuid = undefined;

    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      if (submission) {
        this.noiSubmission = submission;
      }
    });
  }

  ngAfterViewInit(): void {
    combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.paramMap])
      .pipe(takeUntil(this.$destroy))
      .subscribe(([queryParamMap, paramMap]) => {
        const fileId = paramMap.get('fileId');
        if (fileId) {
          this.loadDraftSubmission(fileId).then(() => {
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

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private async loadDraftSubmission(fileId: string) {
    if (!this.noiSubmission) {
      this.overlayService.showSpinner();
      this.noiSubmission = await this.noticeOfIntentSubmissionDraftService.getByFileId(fileId);
      const documents = await this.noticeOfIntentDocumentService.getByFileId(fileId);
      if (documents) {
        this.$noiDocuments.next(documents);
      }
      this.fileId = fileId;
      this.$noiSubmission.next(this.noiSubmission);
      this.overlayService.hideSpinner();
    }
  }

  // this gets fired whenever applicant navigates away from edit page
  async canDeactivate(): Promise<Observable<boolean>> {
    await this.saveSubmission(this.customStepper.selectedIndex);
    return of(true);
  }

  async onStepChange($event: StepperSelectionEvent) {
    // scrolls to top of page
    scrollToElement({ id: `siteLayout`, center: false });
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

  async switchStep(index: number) {
    // navigation to url will cause step change based on the index (index starts from 0)
    // The save will be triggered using canDeactivate guard
    this.showValidationErrors = this.customStepper.selectedIndex === EditNoiSteps.ReviewAndSubmit;
    await this.router.navigateByUrl(`/alcs/notice-of-intent/${this.fileId}/edit/${index}`);
  }

  onParcelDetailsInitialized() {
    if (this.expandedParcelUuid && this.parcelDetailsComponent) {
      this.parcelDetailsComponent.openParcel(this.expandedParcelUuid);
      this.expandedParcelUuid = undefined;
    }
  }

  async onDownloadPdf(fileNumber: string | undefined) {
    //TODO: Add this
  }

  async onExit() {
    await this.noticeOfIntentSubmissionDraftService.delete(this.fileId);
    window.location.href = `${environment.alcsUrl}/notice-of-intent/${this.fileId}/applicant-info`;
  }

  async onSubmit() {
    this.dialog
      .open(ConfirmPublishDialogComponent)
      .beforeClosed()
      .subscribe(async (didConfirm) => {
        if (didConfirm) {
          await this.noticeOfIntentSubmissionDraftService.publish(this.fileId);
          window.location.href = `${environment.alcsUrl}/notice-of-intent/${this.fileId}/applicant-info`;
        }
      });
  }
}
